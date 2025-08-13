export class AIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDeGOiOFZ43ZjXyI_m4svgsCD6H9fg4ONE';
  }

  async validateWithAI(data: any, schema: any): Promise<{isValid: boolean; errors?: string[]}> {
    const prompt = `
      Validate this data against the provided schema:
      Data: ${JSON.stringify(data)}
      Schema: ${JSON.stringify(schema)}
      
      Return a JSON object with:
      1. isValid: boolean indicating if the data is valid
      2. errors: array of validation error messages (if any)
      
      Response format: { "isValid": boolean, "errors": string[] }
    `;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      const result = await response.json();
      const validationResult = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      try {
        return JSON.parse(validationResult);
      } catch (error) {
        console.error('Failed to parse validation result:', error);
        return { isValid: false, errors: ['Failed to validate data'] };
      }
    } catch (error) {
      console.error('AI Validation Error:', error);
      return { isValid: false, errors: ['Validation service unavailable'] };
    }
  }

  async enhanceData(data: any[], dataType: 'clients' | 'workers' | 'tasks'): Promise<any[]> {
    const prompt = this.getEnhancementPrompt(data, dataType);
    
    try {
      console.log('Enhancing data with Gemini API...');
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Gemini API response received');
      
      const enhancedDataText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!enhancedDataText) {
        console.error('No text in Gemini API response:', JSON.stringify(result));
        throw new Error('No text in Gemini API response');
      }
      
      // Parse the AI response and return enhanced data
      const enhancedData = this.parseAIResponse(enhancedDataText, data);
      console.log('Enhanced data parsed successfully');
      return enhancedData;
    } catch (error) {
      console.error('AI Enhancement Error:', error);
      return data; 
    }
  }

  async searchData(query: string, data: any[]): Promise<any[]> {
    const prompt = `
      Given this natural language query: "${query}"
      And this data: ${JSON.stringify(data.slice(0, 10))}
      
      Return only the items that match the query criteria. 
      Respond with valid JSON array format only.
    `;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      const result = await response.json();
      const searchResults = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return JSON.parse(searchResults);
    } catch (error) {
      console.error('AI Search Error:', error);
      return [];
    }
  }

  async generateRule(description: string): Promise<any> {
    const prompt = `
      Convert this natural language rule description into a structured rule object:
      "${description}"
      
      Return a JSON object with this structure:
      {
        "type": "coRun|slotRestriction|loadLimit|phaseWindow|precedence",
        "name": "Rule Name",
        "description": "Rule Description",
        "parameters": {}
      }
    `;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      const result = await response.json();
      const ruleText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return JSON.parse(ruleText);
    } catch (error) {
      console.error('AI Rule Generation Error:', error);
      return null;
    }
  }

  private getEnhancementPrompt(data: any[], dataType: string): string {
    return `
      Analyze and enhance this ${dataType} data for quality and completeness:
      ${JSON.stringify(data.slice(0, 5))}
      
      Please:
      1. Fix any obvious data quality issues
      2. Standardize formats
      3. Fill in missing reasonable values where appropriate
      4. Ensure data consistency
      
      IMPORTANT: You must return ONLY a valid JSON array containing the enhanced data. 
      Do not include any explanations, markdown formatting, or text before or after the JSON array.
      The response should be parseable directly with JSON.parse().
      
      Example of correct response format:
      [{"id":1,"name":"Example","value":100},...]  
    `;
  }

  private parseAIResponse(response: string, originalData: any[]): any[] {
    try {
      if (!response) {
        console.error('Empty response from AI');
        return originalData;
      }

      // First try direct JSON parsing
      try {
        return JSON.parse(response);
      } catch (directParseError) {
        console.log(directParseError);
        // If direct parsing fails, try to extract JSON array pattern
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // If that fails too, try to extract JSON object pattern and wrap in array
        const objectMatch = response.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          const parsedObject = JSON.parse(objectMatch[0]);
          // If it's an array-like object with numeric keys, convert to array
          if (Object.keys(parsedObject).every(key => !isNaN(Number(key)))) {
            return Object.values(parsedObject);
          }
          // Otherwise return as single-item array
          return [parsedObject];
        }
      }
      
      console.error('Failed to parse AI response:', response);
      return originalData;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return originalData;
    }
  }
}

export const aiService = new AIService();
