// components/ApiSandbox.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ApiSandbox() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [body, setBody] = useState('')
  const [headers, setHeaders] = useState('{"Content-Type": "application/json"}')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const executeRequest = async () => {
    setLoading(true)
    try {
      // In production, this should call your backend service that runs the student's code
      // For demo purposes, we'll mock it
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          url,
          body: method !== 'GET' ? body : undefined,
          headers: JSON.parse(headers),
        }),
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(JSON.stringify({ error: error.message }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter endpoint URL"
            className="flex-1"
          />
          <Button onClick={executeRequest} disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>

        <Tabs defaultValue="body">
          <TabsList>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </TabsList>
          <TabsContent value="body">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Request body (JSON)"
              className="h-40 font-mono"
            />
          </TabsContent>
          <TabsContent value="headers">
            <Textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder="Request headers (JSON)"
              className="h-40 font-mono"
            />
          </TabsContent>
        </Tabs>

        <div>
          <h3 className="text-sm font-medium mb-2">Response</h3>
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">
            {response || 'Response will appear here...'}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}