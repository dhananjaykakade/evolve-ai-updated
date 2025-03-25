
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown, Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";

export const ContentGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");

  const handleGenerateContent = () => {
    if (!topic || !contentType) {
      toast.error("Please enter topic and select content type");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generating content
    setTimeout(() => {
      const mockContent = `# ${topic} - ${contentType === "summary" ? "Summary" : 
        contentType === "detailed" ? "Detailed Notes" : 
        contentType === "flashcards" ? "Flashcards" : "Concept Map"}
        
${contentType === "summary" ? 
`Object-oriented programming (OOP) is a programming paradigm that uses objects and classes in software design. It focuses on:

1. Encapsulation: Bundling data and methods that operate on that data.
2. Inheritance: Ability to create new classes based on existing ones.
3. Polymorphism: Processing objects differently based on their class type.
4. Abstraction: Hiding complex implementation details and showing only functionality.

These principles help create modular, reusable, and maintainable code.` : 

contentType === "detailed" ? 
`## Object-Oriented Programming: Detailed Notes

### Definition
Object-Oriented Programming (OOP) is a programming paradigm based on the concept of "objects," which can contain data in the form of fields (attributes or properties) and code in the form of procedures (methods).

### Key Principles

#### 1. Encapsulation
- **Definition**: Bundling data and methods that operate on that data within a single unit (class).
- **Benefits**: 
  - Data hiding and protection
  - Reduced complexity
  - Increased reusability
- **Implementation**: Access modifiers (public, private, protected)

#### 2. Inheritance
- **Definition**: Mechanism where a new class inherits properties and behaviors from an existing class.
- **Types**:
  - Single inheritance
  - Multiple inheritance
  - Hierarchical inheritance
  - Multilevel inheritance
- **Benefits**:
  - Code reusability
  - Extensibility
  - Supports hierarchical classification

#### 3. Polymorphism
- **Definition**: Ability of different classes to be treated as instances of the same class.
- **Types**:
  - Compile-time polymorphism (method overloading)
  - Runtime polymorphism (method overriding)
- **Benefits**:
  - Flexibility
  - Extensibility
  - Interface simplification

#### 4. Abstraction
- **Definition**: Exposing only essential features while hiding implementation details.
- **Implementation**: Abstract classes and interfaces
- **Benefits**:
  - Reduced complexity
  - Increased security
  - Easier maintenance

### OOP vs. Other Paradigms
- **Procedural Programming**: Focuses on procedures/functions; OOP focuses on objects.
- **Functional Programming**: Focuses on functions and immutability; OOP allows state changes.

### Common OOP Languages
- Java
- C++
- C#
- Python
- Ruby` : 

contentType === "flashcards" ? 
`## Flashcards: Object-Oriented Programming

Card 1:
Q: What is Encapsulation?
A: The bundling of data and methods that operate on that data within a single unit (class), often restricting access to some of the object's components.

Card 2:
Q: What is Inheritance?
A: A mechanism where a new class (subclass) inherits properties and behaviors from an existing class (superclass).

Card 3:
Q: What is Polymorphism?
A: The ability to present the same interface for different underlying forms or data types.

Card 4:
Q: What is Abstraction?
A: The concept of hiding complex implementation details and showing only the necessary features of an object.

Card 5:
Q: What is a Class?
A: A blueprint for creating objects, providing initial values for state and implementations of behavior.

Card 6:
Q: What is an Object?
A: An instance of a class that contains data and methods to manipulate the data.

Card 7:
Q: What is Method Overriding?
A: The process where a subclass provides a specific implementation of a method that is already defined in its superclass.

Card 8:
Q: What is Method Overloading?
A: The creation of multiple methods with the same name but different parameters in the same class.` : 

`## Object-Oriented Programming: Concept Map

- Object-Oriented Programming (OOP)
  |
  |-- Core Principles
  |    |-- Encapsulation
  |    |    |-- Data hiding
  |    |    |-- Access modifiers (public, private, protected)
  |    |
  |    |-- Inheritance
  |    |    |-- Superclass (parent)
  |    |    |-- Subclass (child)
  |    |    |-- Types (single, multiple, hierarchical, multilevel)
  |    |
  |    |-- Polymorphism
  |    |    |-- Method overloading (compile-time)
  |    |    |-- Method overriding (runtime)
  |    |
  |    |-- Abstraction
  |         |-- Abstract classes
  |         |-- Interfaces
  |
  |-- Components
  |    |-- Class (blueprint)
  |    |-- Object (instance)
  |    |-- Methods (behaviors)
  |    |-- Attributes (properties)
  |
  |-- Benefits
  |    |-- Reusability
  |    |-- Modularity
  |    |-- Maintainability
  |    |-- Security
  |
  |-- Languages
       |-- Java
       |-- C++
       |-- C#
       |-- Python
       |-- Ruby`}`;
      
      setGeneratedContent(mockContent);
      setIsGenerating(false);
      toast.success("Content generated successfully");
    }, 2500);
  };

  const handleExportPDF = () => {
    toast.success("Content exported as PDF");
  };

  const handleSaveToResources = () => {
    toast.success("Content saved to resources");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="topic">Topic Name</Label>
          <Input 
            id="topic" 
            placeholder="e.g. Object-Oriented Programming" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content-type">Content Type</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger id="content-type">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="detailed">Detailed Notes</SelectItem>
              <SelectItem value="flashcards">Flashcards</SelectItem>
              <SelectItem value="conceptmap">Concept Map</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={handleGenerateContent}
            disabled={isGenerating || !topic || !contentType}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">AI-Generated Content</h3>
          {generatedContent && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileDown className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveToResources}>
                <Save className="mr-2 h-4 w-4" />
                Save to Resources
              </Button>
            </div>
          )}
        </div>
        
        {!generatedContent ? (
          <div className="text-center p-12 border rounded-md border-dashed">
            <p className="text-muted-foreground">
              Generated content will appear here
            </p>
          </div>
        ) : (
          <Textarea 
            value={generatedContent} 
            onChange={(e) => setGeneratedContent(e.target.value)}
            className="min-h-[400px] font-mono"
          />
        )}
      </div>
    </div>
  );
};
