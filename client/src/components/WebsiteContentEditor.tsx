import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/RichTextEditor";
import DocumentBlockEditor from "@/components/DocumentBlockEditor";
import HTMLEditor from "@/components/HTMLEditor";

interface WebsiteContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  variables?: Array<{ label: string; value: string }>;
}

export function WebsiteContentEditor({
  value,
  onChange,
  placeholder = "Write content...",
  minHeight = "220px",
  variables,
}: WebsiteContentEditorProps) {
  return (
    <Tabs defaultValue="richtext" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="richtext">Rich Text</TabsTrigger>
        <TabsTrigger value="blocks">Blocks</TabsTrigger>
        <TabsTrigger value="html">HTML</TabsTrigger>
      </TabsList>
      <TabsContent value="richtext" className="mt-2">
        <RichTextEditor value={value} onChange={onChange} placeholder={placeholder} minHeight={minHeight} />
      </TabsContent>
      <TabsContent value="blocks" className="mt-2">
        <DocumentBlockEditor value={value} onChange={onChange} placeholder={placeholder} minHeight={minHeight} variables={variables} />
      </TabsContent>
      <TabsContent value="html" className="mt-2">
        <HTMLEditor value={value} onChange={onChange} placeholder="Enter HTML content" minHeight={minHeight} variables={variables} />
      </TabsContent>
    </Tabs>
  );
}

export default WebsiteContentEditor;
