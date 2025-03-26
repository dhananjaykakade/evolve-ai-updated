
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Users, Search, Plus, MessageCircle, X, Calendar, BookOpen } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

interface Student {
  id: number;
  name: string;
  avatar?: string;
}

interface Message {
  id: number;
  content: string;
  sender: Student;
  timestamp: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  subject: string;
  members: Student[];
  messages: Message[];
  isJoined: boolean;
}

const StudentGroups: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [message, setMessage] = useState('');
  
  // Sample user
  const currentUser: Student = {
    id: 1,
    name: 'Alex Johnson'
  };
  
  // Sample data - would come from API in real application
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 1,
      name: "Quantum Physics Study Group",
      description: "A group for discussing quantum physics concepts and problem-solving approaches",
      subject: "Physics",
      members: [
        { id: 2, name: "Emma Smith" },
        { id: 3, name: "Noah Williams" },
        { id: 4, name: "Olivia Brown" }
      ],
      messages: [
        { 
          id: 1, 
          content: "Has anyone started on the problem set for this week?", 
          sender: { id: 2, name: "Emma Smith" },
          timestamp: "Yesterday at 3:45 PM"
        },
        { 
          id: 2, 
          content: "Yes, I'm working on it. Problem 3 is particularly challenging.", 
          sender: { id: 3, name: "Noah Williams" },
          timestamp: "Yesterday at 4:12 PM"
        }
      ],
      isJoined: false
    },
    {
      id: 2,
      name: "Advanced Calculus Group",
      description: "For students taking advanced calculus who want to collaborate on homework and study for exams",
      subject: "Mathematics",
      members: [
        { id: 5, name: "Liam Wilson" },
        { id: 6, name: "Sophia Davis" },
        { id: 7, name: "Mason Garcia" }
      ],
      messages: [
        { 
          id: 3, 
          content: "I created a summary of integration techniques we've covered so far", 
          sender: { id: 5, name: "Liam Wilson" },
          timestamp: "2 days ago"
        }
      ],
      isJoined: false
    },
    {
      id: 3,
      name: "Literature Analysis Circle",
      description: "Discussing literary works, themes, and writing techniques for English Literature courses",
      subject: "English Literature",
      members: [
        { id: 8, name: "Ava Martinez" },
        { id: 9, name: "Ethan Anderson" }
      ],
      messages: [
        { 
          id: 4, 
          content: "What are your thoughts on the symbolism in chapter 5?", 
          sender: { id: 8, name: "Ava Martinez" },
          timestamp: "3 days ago"
        }
      ],
      isJoined: true
    }
  ]);
  
  const [myGroups, setMyGroups] = useState<Group[]>([
    {
      id: 3,
      name: "Literature Analysis Circle",
      description: "Discussing literary works, themes, and writing techniques for English Literature courses",
      subject: "English Literature",
      members: [
        { id: 8, name: "Ava Martinez" },
        { id: 9, name: "Ethan Anderson" },
        currentUser
      ],
      messages: [
        { 
          id: 4, 
          content: "What are your thoughts on the symbolism in chapter 5?", 
          sender: { id: 8, name: "Ava Martinez" },
          timestamp: "3 days ago"
        }
      ],
      isJoined: true
    }
  ]);

  const handleCreateGroup = (name: string, description: string, subject: string) => {
    const newGroup: Group = {
      id: Date.now(),
      name,
      description,
      subject,
      members: [currentUser],
      messages: [],
      isJoined: true
    };
    
    setGroups([...groups, newGroup]);
    setMyGroups([...myGroups, newGroup]);
    
    toast({
      title: "Group Created",
      description: `Successfully created "${name}" study group`,
    });
  };

  const handleJoinGroup = (group: Group) => {
    // Update groups list
    const updatedGroups = groups.map(g => {
      if (g.id === group.id) {
        return {
          ...g,
          members: [...g.members, currentUser],
          isJoined: true
        };
      }
      return g;
    });
    
    // Update my groups list
    const joinedGroup = updatedGroups.find(g => g.id === group.id);
    if (joinedGroup && !myGroups.some(g => g.id === group.id)) {
      setMyGroups([...myGroups, joinedGroup]);
    }
    
    setGroups(updatedGroups);
    
    toast({
      title: "Group Joined",
      description: `You have joined "${group.name}"`,
    });
  };

  const handleLeaveGroup = (group: Group) => {
    // Update groups list
    const updatedGroups = groups.map(g => {
      if (g.id === group.id) {
        return {
          ...g,
          members: g.members.filter(member => member.id !== currentUser.id),
          isJoined: false
        };
      }
      return g;
    });
    
    // Remove from my groups
    const updatedMyGroups = myGroups.filter(g => g.id !== group.id);
    
    setGroups(updatedGroups);
    setMyGroups(updatedMyGroups);
    
    if (selectedGroup?.id === group.id) {
      setSelectedGroup(null);
    }
    
    toast({
      title: "Group Left",
      description: `You have left "${group.name}"`,
    });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedGroup) return;
    
    const newMessage = {
      id: Date.now(),
      content: message,
      sender: currentUser,
      timestamp: "Just now"
    };
    
    // Update the messages in the selected group
    const updatedMyGroups = myGroups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          messages: [...group.messages, newMessage]
        };
      }
      return group;
    });
    
    setMyGroups(updatedMyGroups);
    
    // Update the selected group with the new message
    if (selectedGroup) {
      setSelectedGroup({
        ...selectedGroup,
        messages: [...selectedGroup.messages, newMessage]
      });
    }
    
    setMessage('');
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const GroupCard = ({ group }: { group: Group }) => (
    <Card className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedGroup(group)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{group.name}</h3>
            <Badge variant="outline" className="mt-1">{group.subject}</Badge>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{group.description}</p>
          </div>
          {activeTab === 'browse' && (
            group.isJoined ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLeaveGroup(group);
                }}
              >
                Leave
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinGroup(group);
                }}
              >
                Join
              </Button>
            )
          )}
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{group.members.length} members</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{group.messages.length} messages</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CreateGroupDialog = () => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupSubject, setGroupSubject] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!groupName.trim()) {
        toast({
          title: "Group Name Required",
          description: "Please enter a name for your group",
          variant: "destructive"
        });
        return;
      }
      
      if (!groupSubject.trim()) {
        toast({
          title: "Subject Required",
          description: "Please enter a subject for your group",
          variant: "destructive"
        });
        return;
      }
      
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        handleCreateGroup(groupName, groupDescription, groupSubject);
        setGroupName('');
        setGroupDescription('');
        setGroupSubject('');
        setIsSubmitting(false);
      }, 1000);
    };
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus size={16} className="mr-2" />
            Create Group
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a New Study Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input 
                  id="group-name" 
                  placeholder="E.g., Advanced Physics Study Group" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-subject">Subject</Label>
                <Input 
                  id="group-subject" 
                  placeholder="E.g., Physics, Mathematics, Literature" 
                  value={groupSubject}
                  onChange={(e) => setGroupSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Description</Label>
                <Textarea 
                  id="group-description" 
                  placeholder="Describe the purpose and goals of your study group..." 
                  rows={3}
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <Layout title="Student Groups">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users size={24} className="text-primary" />
          <h2 className="text-3xl font-semibold tracking-tight">Study Groups</h2>
        </div>
        <p className="text-muted-foreground">
          Join or create study groups to collaborate with other students.
        </p>
        
        {selectedGroup ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setSelectedGroup(null)}
                className="gap-2"
              >
                <X size={16} />
                Close Group
              </Button>
              
              {selectedGroup.isJoined && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleLeaveGroup(selectedGroup)}
                >
                  Leave Group
                </Button>
              )}
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedGroup.name}</CardTitle>
                    <Badge variant="outline" className="mt-2">{selectedGroup.subject}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users size={14} />
                    <span>{selectedGroup.members.length} members</span>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2">{selectedGroup.description}</p>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="chat">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                      value="chat"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Group Chat
                    </TabsTrigger>
                    <TabsTrigger
                      value="members"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Members
                    </TabsTrigger>
                    <TabsTrigger
                      value="resources"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Resources
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chat" className="p-4">
                    <div className="h-[400px] flex flex-col">
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {selectedGroup.messages.length > 0 ? (
                          selectedGroup.messages.map(msg => (
                            <div key={msg.id} className="flex gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                {msg.sender.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{msg.sender.name}</span>
                                  <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                                </div>
                                <p className="text-sm mt-1">{msg.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No messages yet. Be the first to start the conversation!
                          </div>
                        )}
                      </div>
                      
                      {selectedGroup.isJoined ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <Button onClick={handleSendMessage}>
                            <MessageCircle size={16} className="mr-2" />
                            Send
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => handleJoinGroup(selectedGroup)}
                        >
                          Join Group to Participate
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="members" className="p-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Members ({selectedGroup.members.length})</h3>
                      <div className="divide-y">
                        {selectedGroup.members.map(member => (
                          <div key={member.id} className="py-2 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {member.name.charAt(0)}
                            </div>
                            <span>{member.name}</span>
                            {member.id === currentUser.id && (
                              <Badge variant="secondary" className="ml-2">You</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="resources" className="p-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Shared Resources</h3>
                      <div className="text-center py-8">
                        <BookOpen size={40} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No resources have been shared yet.
                        </p>
                        
                        {selectedGroup.isJoined && (
                          <Button className="mt-4">
                            <Plus size={14} className="mr-2" />
                            Share Resource
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search groups..."
                  className="w-full sm:w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <CreateGroupDialog />
            </div>
            
            <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="browse">Browse Groups</TabsTrigger>
                <TabsTrigger value="my-groups">My Groups</TabsTrigger>
              </TabsList>
              
              <TabsContent value="browse" className="space-y-4">
                {filteredGroups.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredGroups.map(group => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No groups found</h3>
                    <p className="text-muted-foreground mb-6">
                      No groups match your search criteria.
                    </p>
                    <CreateGroupDialog />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="my-groups" className="space-y-4">
                {myGroups.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {myGroups
                      .filter(group => 
                        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        group.subject.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(group => (
                        <GroupCard key={group.id} group={group} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">You haven't joined any groups yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Join an existing group or create your own to collaborate with other students.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button variant="outline" onClick={() => setActiveTab('browse')}>
                        Browse Groups
                      </Button>
                      <CreateGroupDialog />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
};

export default StudentGroups;
