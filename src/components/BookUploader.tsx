
import { useState } from "react";
import { toast } from "sonner";
import { FilePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadBook } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BookUploader = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [semester, setSemester] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast.error("Please select a PDF file");
        e.target.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    toast.info("Uploading book...");

    try {
      const metadata = {
        grade: grade ? parseInt(grade) : undefined,
        subject: subject || undefined,
        semester: semester ? parseInt(semester) : undefined
      };

      const result = await uploadBook(file, metadata);

      if (result.success) {
        toast.success("Book uploaded successfully!");
        setFile(null);
        setGrade("");
        setSubject("");
        setSemester("");
        setOpen(false);
        onUploadSuccess();
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading book:", error);
      toast.error("Failed to upload book. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const subjects = [
    "Mathematics", "Science", "Physics", "Chemistry", "Biology", 
    "English", "History", "Geography", "Computer Science", "Economics", 
    "Business Studies", "Accounting", "Art", "Music", "Physical Education"
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FilePlus className="h-4 w-4" />
          <span>Upload Book</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload PDF Book</DialogTitle>
          <DialogDescription>
            Upload a PDF book to generate multiple-choice questions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">PDF File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
            />
            {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="grade">Grade Level (Optional)</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger id="grade">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <SelectItem key={g} value={g.toString()}>
                    Grade {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="semester">Semester (Optional)</Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger id="semester">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || !file}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookUploader;
