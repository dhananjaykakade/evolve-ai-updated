
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  AlertCircle, 
  FileUp, 
  Loader2, 
  Search, 
  Check, 
  ExternalLink, 
  Download,
  Lightbulb 
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const PlagiarismChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState("paste");
  const [textContent, setTextContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [results, setResults] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      toast.success(`File uploaded: ${file.name}`);
      
      // For demo purposes only - normally we'd read the file content
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTextContent(event.target.result.toString().substring(0, 200) + "...");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCheck = () => {
    if ((activeTab === "paste" && !textContent) || (activeTab === "upload" && !fileName)) {
      toast.error("Please provide content to check");
      return;
    }

    setIsChecking(true);
    
    // Simulate plagiarism check
    setTimeout(() => {
      const mockResults = {
        score: 23, // percentage of plagiarism
        wordCount: 847,
        matches: [
          {
            text: "The concept of object-oriented programming revolves around data encapsulation and inheritance",
            similarity: 89,
            source: "Introduction to Computer Science, MIT OpenCourseware",
            url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-00sc-introduction-to-computer-science-and-programming-spring-2011/"
          },
          {
            text: "Object-oriented languages like Java implement encapsulation through the use of classes and access modifiers",
            similarity: 76,
            source: "Java Programming Tutorials, Oracle Documentation",
            url: "https://docs.oracle.com/javase/tutorial/"
          },
          {
            text: "Inheritance allows a class to inherit attributes and methods from another class",
            similarity: 92,
            source: "Programming Fundamentals Textbook",
            url: "https://example.com/textbook"
          }
        ],
        suggestions: [
          "Rephrase the highlighted sections using your own words",
          "Add proper citations for direct quotes",
          "Include more original analysis and examples",
          "Compare different perspectives on the topic"
        ]
      };
      
      setResults(mockResults);
      setIsChecking(false);
      toast.success("Plagiarism check completed");
    }, 3000);
  };

  const handleDownloadReport = () => {
    toast.success("Report downloaded successfully");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">Paste Text</TabsTrigger>
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
        </TabsList>
        
        <TabsContent value="paste" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="content">Paste content to check for plagiarism</Label>
            <Textarea 
              id="content" 
              placeholder="Enter text here..."
              className="min-h-[200px]"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="document">Upload document</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      id="document"
                      accept=".txt,.doc,.docx,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById("document")?.click()}
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      {fileName ? fileName : "Select file"}
                    </Button>
                  </div>
                </div>
                
                {fileName && (
                  <div className="w-full rounded-md bg-muted p-4">
                    <p className="text-sm font-medium">{fileName}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {textContent || "File content preview..."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Button 
        className="w-full" 
        onClick={handleCheck}
        disabled={isChecking || ((activeTab === "paste" && !textContent) || (activeTab === "upload" && !fileName))}
      >
        {isChecking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking for Plagiarism...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Check for Plagiarism
          </>
        )}
      </Button>
      
      {isChecking && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Analyzing document...</span>
                <span>Please wait</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
      
      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Plagiarism Analysis Results</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleDownloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <div className="flex flex-col items-center">
                      <div className={`text-3xl font-bold ${results.score > 30 ? 'text-red-500' : results.score > 15 ? 'text-amber-500' : 'text-green-500'}`}>
                        {results.score}%
                      </div>
                      <CardDescription>Plagiarism Score</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold">
                        {results.matches.length}
                      </div>
                      <CardDescription>Matching Sources</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold">
                        {results.wordCount}
                      </div>
                      <CardDescription>Word Count</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Matching Content</CardTitle>
              <CardDescription>
                The following sections have high similarity with existing sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.matches.map((match: any, index: number) => (
                <Card key={index} className={`border-l-4 ${match.similarity > 80 ? 'border-l-red-500' : match.similarity > 60 ? 'border-l-amber-500' : 'border-l-yellow-200'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium flex items-center">
                        <AlertCircle className={`h-4 w-4 mr-2 ${match.similarity > 80 ? 'text-red-500' : match.similarity > 60 ? 'text-amber-500' : 'text-yellow-500'}`} />
                        Match #{index + 1} ({match.similarity}% similarity)
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm italic bg-muted p-2 rounded-md">"{match.text}"</p>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-muted-foreground">Source: {match.source}</span>
                      <Button variant="link" size="sm" className="h-auto p-0" asChild>
                        <a href={match.url} target="_blank" rel="noopener noreferrer">
                          View Source <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                AI-Suggested Rewriting Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Generate Alternative Phrasing
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

// Hidden component to make the code work
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};
