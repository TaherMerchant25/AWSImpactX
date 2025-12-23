"""
MCP Hub - Model Context Protocol Hub
Universal tool access layer for agent coordination
"""
import json
import os
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
from aws_lambda_powertools import Logger, Tracer
import boto3
from datetime import datetime

logger = Logger()
tracer = Tracer()


class ToolType(Enum):
    """Types of tools available in MCP Hub"""
    DATABASE = "database"
    API = "api"
    LAMBDA = "lambda"
    CALCULATION = "calculation"
    SEARCH = "search"


@dataclass
class Tool:
    """Represents a tool accessible through MCP"""
    name: str
    type: ToolType
    description: str
    parameters: Dict[str, Any]
    handler: Callable
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ToolInvocation:
    """Represents a tool invocation request"""
    tool_name: str
    parameters: Dict[str, Any]
    context: Dict[str, Any]
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class ToolResult:
    """Represents the result of a tool invocation"""
    success: bool
    data: Any
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class MCPHub:
    """
    Model Context Protocol Hub
    Provides universal tool access for all agents
    """
    
    def __init__(self):
        self.tools: Dict[str, Tool] = {}
        self.lambda_client = boto3.client('lambda')
        self.dynamodb = boto3.resource('dynamodb')
        self.rds_client = boto3.client('rds-data')
        self.invocation_history: List[ToolInvocation] = []
        
        # Register built-in tools
        self._register_builtin_tools()
    
    def _register_builtin_tools(self):
        """Register built-in tools"""
        
        # Database query tool
        self.register_tool(Tool(
            name="query_database",
            type=ToolType.DATABASE,
            description="Query application database for structured data",
            parameters={
                "query": {"type": "string", "required": True},
                "database": {"type": "string", "required": False}
            },
            handler=self._handle_database_query
        ))
        
        # External API call tool
        self.register_tool(Tool(
            name="call_external_api",
            type=ToolType.API,
            description="Call external API for additional data",
            parameters={
                "endpoint": {"type": "string", "required": True},
                "method": {"type": "string", "required": False, "default": "GET"},
                "payload": {"type": "object", "required": False}
            },
            handler=self._handle_api_call
        ))
        
        # Lambda function invocation tool
        self.register_tool(Tool(
            name="invoke_lambda",
            type=ToolType.LAMBDA,
            description="Invoke AWS Lambda function for processing",
            parameters={
                "function_name": {"type": "string", "required": True},
                "payload": {"type": "object", "required": True}
            },
            handler=self._handle_lambda_invocation
        ))
        
        # Mathematical calculation tool
        self.register_tool(Tool(
            name="calculate",
            type=ToolType.CALCULATION,
            description="Perform mathematical calculations",
            parameters={
                "expression": {"type": "string", "required": True},
                "variables": {"type": "object", "required": False}
            },
            handler=self._handle_calculation
        ))
        
        # Knowledge graph search tool
        self.register_tool(Tool(
            name="search_knowledge_graph",
            type=ToolType.SEARCH,
            description="Search hierarchical knowledge graph",
            parameters={
                "query": {"type": "string", "required": True},
                "entity_type": {"type": "string", "required": False}
            },
            handler=self._handle_knowledge_search
        ))
    
    def register_tool(self, tool: Tool):
        """Register a new tool in the MCP Hub"""
        self.tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name}")
    
    @tracer.capture_method
    def invoke_tool(self, tool_name: str, parameters: Dict[str, Any], 
                   context: Optional[Dict[str, Any]] = None) -> ToolResult:
        """
        Invoke a tool by name with parameters
        """
        if tool_name not in self.tools:
            return ToolResult(
                success=False,
                data=None,
                error=f"Tool '{tool_name}' not found"
            )
        
        tool = self.tools[tool_name]
        
        # Validate parameters
        validation_result = self._validate_parameters(tool, parameters)
        if not validation_result['valid']:
            return ToolResult(
                success=False,
                data=None,
                error=validation_result['error']
            )
        
        # Record invocation
        invocation = ToolInvocation(
            tool_name=tool_name,
            parameters=parameters,
            context=context or {}
        )
        self.invocation_history.append(invocation)
        
        # Execute tool
        try:
            logger.info(f"Invoking tool: {tool_name}")
            result_data = tool.handler(parameters, context)
            
            return ToolResult(
                success=True,
                data=result_data,
                metadata={
                    'tool_name': tool_name,
                    'execution_time': datetime.utcnow().isoformat()
                }
            )
            
        except Exception as e:
            logger.exception(f"Error invoking tool {tool_name}")
            return ToolResult(
                success=False,
                data=None,
                error=str(e)
            )
    
    def _validate_parameters(self, tool: Tool, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Validate tool parameters"""
        
        for param_name, param_spec in tool.parameters.items():
            # Check required parameters
            if param_spec.get('required', False) and param_name not in parameters:
                return {
                    'valid': False,
                    'error': f"Required parameter '{param_name}' missing"
                }
            
            # Apply defaults
            if param_name not in parameters and 'default' in param_spec:
                parameters[param_name] = param_spec['default']
        
        return {'valid': True}
    
    # Tool Handlers
    
    def _handle_database_query(self, parameters: Dict[str, Any], 
                               context: Optional[Dict[str, Any]]) -> Any:
        """Handle database query tool"""
        
        query = parameters['query']
        database = parameters.get('database', 'default')
        
        # Execute query using RDS Data API or DynamoDB
        try:
            # Example: DynamoDB query
            table_name = os.environ.get('DYNAMODB_TABLE')
            table = self.dynamodb.Table(table_name)
            
            # Parse simple queries (this is simplified)
            if 'SELECT' in query.upper():
                # This is a placeholder - implement actual SQL parsing
                response = table.scan()
                return response.get('Items', [])
            
            return []
            
        except Exception as e:
            logger.error(f"Database query error: {e}")
            raise
    
    def _handle_api_call(self, parameters: Dict[str, Any], 
                        context: Optional[Dict[str, Any]]) -> Any:
        """Handle external API call tool"""
        
        import requests
        
        endpoint = parameters['endpoint']
        method = parameters.get('method', 'GET')
        payload = parameters.get('payload')
        
        try:
            if method.upper() == 'GET':
                response = requests.get(endpoint, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(endpoint, json=payload, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"API call error: {e}")
            raise
    
    def _handle_lambda_invocation(self, parameters: Dict[str, Any], 
                                  context: Optional[Dict[str, Any]]) -> Any:
        """Handle Lambda function invocation tool"""
        
        function_name = parameters['function_name']
        payload = parameters['payload']
        
        try:
            response = self.lambda_client.invoke(
                FunctionName=function_name,
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )
            
            result = json.loads(response['Payload'].read())
            return result
            
        except Exception as e:
            logger.error(f"Lambda invocation error: {e}")
            raise
    
    def _handle_calculation(self, parameters: Dict[str, Any], 
                           context: Optional[Dict[str, Any]]) -> Any:
        """Handle mathematical calculation tool"""
        
        expression = parameters['expression']
        variables = parameters.get('variables', {})
        
        try:
            # Safe evaluation with limited scope
            safe_dict = {
                '__builtins__': {},
                'abs': abs,
                'round': round,
                'min': min,
                'max': max,
                'sum': sum,
                'pow': pow,
                **variables
            }
            
            result = eval(expression, safe_dict)
            return result
            
        except Exception as e:
            logger.error(f"Calculation error: {e}")
            raise
    
    def _handle_knowledge_search(self, parameters: Dict[str, Any], 
                                context: Optional[Dict[str, Any]]) -> Any:
        """Handle knowledge graph search tool"""
        
        query = parameters['query']
        entity_type = parameters.get('entity_type')
        
        # This would integrate with the Vector Store Manager
        # Placeholder implementation
        return {
            'results': [],
            'query': query,
            'entity_type': entity_type
        }
    
    @tracer.capture_method
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get list of available tools with descriptions"""
        
        return [
            {
                'name': tool.name,
                'type': tool.type.value,
                'description': tool.description,
                'parameters': tool.parameters
            }
            for tool in self.tools.values()
        ]
    
    def get_invocation_history(self) -> List[Dict[str, Any]]:
        """Get history of tool invocations"""
        
        return [
            {
                'tool_name': inv.tool_name,
                'parameters': inv.parameters,
                'timestamp': inv.timestamp.isoformat()
            }
            for inv in self.invocation_history
        ]


class MCPContextManager:
    """
    Manages context across multiple agent interactions
    Provides shared memory and state management
    """
    
    def __init__(self):
        self.contexts: Dict[str, Dict[str, Any]] = {}
        self.dynamodb = boto3.resource('dynamodb')
        self.table_name = os.environ.get('CONTEXT_TABLE', 'aspera-contexts')
    
    @tracer.capture_method
    def create_context(self, context_id: str, initial_data: Dict[str, Any]) -> str:
        """Create a new context for agent interaction"""
        
        context = {
            'context_id': context_id,
            'created_at': datetime.utcnow().isoformat(),
            'data': initial_data,
            'history': []
        }
        
        self.contexts[context_id] = context
        
        # Persist to DynamoDB
        try:
            table = self.dynamodb.Table(self.table_name)
            table.put_item(Item=context)
        except Exception as e:
            logger.error(f"Error persisting context: {e}")
        
        return context_id
    
    @tracer.capture_method
    def update_context(self, context_id: str, updates: Dict[str, Any]):
        """Update context with new information"""
        
        if context_id not in self.contexts:
            self.contexts[context_id] = {'data': {}, 'history': []}
        
        self.contexts[context_id]['data'].update(updates)
        self.contexts[context_id]['history'].append({
            'timestamp': datetime.utcnow().isoformat(),
            'updates': updates
        })
        
        # Persist update
        try:
            table = self.dynamodb.Table(self.table_name)
            table.update_item(
                Key={'context_id': context_id},
                UpdateExpression='SET #data = :data, #history = :history',
                ExpressionAttributeNames={
                    '#data': 'data',
                    '#history': 'history'
                },
                ExpressionAttributeValues={
                    ':data': self.contexts[context_id]['data'],
                    ':history': self.contexts[context_id]['history']
                }
            )
        except Exception as e:
            logger.error(f"Error updating context: {e}")
    
    def get_context(self, context_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve context by ID"""
        
        if context_id in self.contexts:
            return self.contexts[context_id]
        
        # Try to load from DynamoDB
        try:
            table = self.dynamodb.Table(self.table_name)
            response = table.get_item(Key={'context_id': context_id})
            
            if 'Item' in response:
                self.contexts[context_id] = response['Item']
                return response['Item']
                
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
        
        return None
