import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Trash2, Image as ImageIcon, Calendar, Video, FileText, FileSpreadsheet, FileArchive, Headphones } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function MediaDailyWorkPage() {
  const [activeTab, setActiveTab] = useState<'blog' | 'daily'>('blog');
  
  // Blog State
  const [blogMedia, setBlogMedia] = useState<any[]>([]);
  const [blogFile, setBlogFile] = useState<File | null>(null);
  const [blogUploading, setBlogUploading] = useState(false);

  // Daily Work State
  const [dailyWorks, setDailyWorks] = useState<any[]>([]);
  const [dailyFile, setDailyFile] = useState<File | null>(null);
  const [dailyDate, setDailyDate] = useState('');
  const [dailyDesc, setDailyDesc] = useState('');
  const [dailyUploading, setDailyUploading] = useState(false);

  useEffect(() => {
    fetchBlogMedia();
    fetchDailyWorks();
  }, []);

  const fetchBlogMedia = async () => {
    try {
      const res = await fetch(`${API_URL}/media/blog`);
      const data = await res.json();
      setBlogMedia(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch blog media', e);
    }
  };

  const fetchDailyWorks = async () => {
    try {
      const res = await fetch(`${API_URL}/media/daily-work`);
      const data = await res.json();
      setDailyWorks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch daily works', e);
    }
  };

  const handleBlogUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogFile) return toast.error('Please select a file');

    setBlogUploading(true);
    const formData = new FormData();
    formData.append('file', blogFile);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/media/blog`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        toast.success('Media uploaded successfully');
        setBlogFile(null);
        fetchBlogMedia();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Upload failed');
      }
    } catch (e) {
      toast.error('An error occurred during upload');
    } finally {
      setBlogUploading(false);
    }
  };

  const handleBlogDelete = async (id: String) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/media/blog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Media deleted');
        fetchBlogMedia();
      } else {
        toast.error('Failed to delete media');
      }
    } catch (e) {
      toast.error('Error deleting media');
    }
  };

  const renderFilePreview = (file: File | null) => {
    if (!file) return null;
    return (
      <div className="mt-4 p-4 border rounded-lg bg-slate-50 flex flex-col gap-2 items-center text-center">
        <FileText className="w-8 h-8 text-blue-500" />
        <div>
          <p className="text-sm font-semibold truncate max-w-xs">{file.name}</p>
          <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    );
  };

  const renderMediaIcon = (type: string) => {
    if (type === 'video') return <Video className="w-8 h-8 text-slate-400" />;
    if (type === 'document') return <FileText className="w-8 h-8 text-slate-400" />;
    return <ImageIcon className="w-8 h-8 text-slate-400" />;
  };

  const handleDailyUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyFile) return toast.error('Please select a file');
    if (!dailyDate) return toast.error('Please select a date');

    setDailyUploading(true);
    const formData = new FormData();
    formData.append('file', dailyFile);
    formData.append('date', dailyDate);
    formData.append('description', dailyDesc);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/media/daily-work`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        toast.success('Daily work uploaded successfully');
        setDailyFile(null);
        setDailyDate('');
        setDailyDesc('');
        fetchDailyWorks();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Upload failed');
      }
    } catch (e) {
      toast.error('An error occurred during upload');
    } finally {
      setDailyUploading(false);
    }
  };

  const handleDailyDelete = async (id: String) => {
    if (!confirm('Are you sure you want to delete this work entry?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/media/daily-work/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Work entry deleted');
        fetchDailyWorks();
      } else {
        toast.error('Failed to delete work entry');
      }
    } catch (e) {
      toast.error('Error deleting work entry');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-amber-500" />
          Media & Daily Work
        </h1>
        <p className="text-slate-500 text-sm">
          Manage photos and videos for the landing page Blogs section and the new Daily Work calendar section.
        </p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('blog')}
          className={`py-2 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'blog' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-navy-700'
          }`}
        >
          Blogs Media
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`py-2 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'daily' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-navy-700'
          }`}
        >
          Daily Work Updates
        </button>
      </div>

      {activeTab === 'blog' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload to Blogs Gallery</CardTitle>
              <CardDescription>Upload photos or videos. These will appear directly in the Blogs section on the homepage.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBlogUpload} className="flex flex-col gap-6">
                <div className="w-full">
                  <Label>Photo / Video / Document</Label>
                  <label htmlFor="blog-file" className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-500">SVG, PNG, JPG, MP4, PDF, DOCX (MAX. 50MB)</p>
                    </div>
                    <Input 
                      id="blog-file" 
                      type="file" 
                      className="hidden"
                      accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip"
                      onChange={(e) => setBlogFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {renderFilePreview(blogFile)}
                </div>
                <Button type="submit" disabled={blogUploading} className="bg-navy-800 hover:bg-navy-700 w-full sm:w-auto self-end">
                  <Upload className="w-4 h-4 mr-2" />
                  {blogUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {blogMedia.map((media) => (
              <div key={media.id} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white aspect-square flex items-center justify-center">
                {media.type === 'video' ? (
                  <video src={media.url} className="w-full h-full object-cover" controls />
                ) : media.type === 'document' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
                    <FileText className="w-12 h-12 text-slate-400 mb-2" />
                    <a href={media.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View File</a>
                  </div>
                ) : (
                  <img src={media.url} alt="Blog media" className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => handleBlogDelete(media.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {blogMedia.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 border border-dashed rounded-lg bg-slate-50">
                No media uploaded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'daily' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Daily Work</CardTitle>
              <CardDescription>Upload a photo/video for a specific date with a short description. This will appear on the homepage next to the calendar.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDailyUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Photo / Video / Document</Label>
                    <label htmlFor="daily-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 mb-2 text-slate-400" />
                        <p className="text-xs text-slate-500 font-semibold">Click to upload file</p>
                      </div>
                      <Input 
                        id="daily-file" 
                        type="file" 
                        className="hidden"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip"
                        onChange={(e) => setDailyFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {renderFilePreview(dailyFile)}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daily-date">Date</Label>
                    <Input 
                      id="daily-date" 
                      type="date" 
                      value={dailyDate}
                      onChange={(e) => setDailyDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily-desc">Short Description</Label>
                  <Textarea 
                    id="daily-desc" 
                    placeholder="Enter details about the work done on this date..."
                    value={dailyDesc}
                    onChange={(e) => setDailyDesc(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={dailyUploading} className="bg-navy-800 hover:bg-navy-700 w-full sm:w-auto">
                  <Upload className="w-4 h-4 mr-2" />
                  {dailyUploading ? 'Uploading...' : 'Save Daily Work'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {dailyWorks.map((work) => (
              <Card key={work.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-32 h-24 rounded bg-slate-100 overflow-hidden shrink-0">
                    {work.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <Video className="w-8 h-8 text-slate-400" />
                      </div>
                    ) : work.type === 'document' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200">
                        <FileText className="w-8 h-8 text-slate-400" />
                      </div>
                    ) : (
                      <img src={work.url} alt="Daily work" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(work.date).toLocaleDateString()}
                    </div>
                    <p className="text-slate-700 text-sm">{work.description || 'No description provided.'}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDailyDelete(work.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
            {dailyWorks.length === 0 && (
              <div className="py-12 text-center text-slate-500 border border-dashed rounded-lg bg-slate-50">
                No daily work entries yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
