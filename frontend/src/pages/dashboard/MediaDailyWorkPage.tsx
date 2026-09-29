import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Trash2, Image as ImageIcon, Calendar, Video, FileText, FileSpreadsheet, FileArchive, Headphones } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function MediaDailyWorkPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

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
    if (!blogFile) return toast.error(isHi ? 'कृपया एक फ़ाइल चुनें' : 'Please select a file');

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
        toast.success(isHi ? 'मीडिया सफलतापूर्वक अपलोड हो गया' : 'Media uploaded successfully');
        setBlogFile(null);
        fetchBlogMedia();
      } else {
        const err = await res.json();
        toast.error(err.error || (isHi ? 'अपलोड विफल रहा' : 'Upload failed'));
      }
    } catch (e) {
      toast.error(isHi ? 'अपलोड के दौरान कोई त्रुटि हुई' : 'An error occurred during upload');
    } finally {
      setBlogUploading(false);
    }
  };

  const handleBlogDelete = async (id: String) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/media/blog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(isHi ? 'मीडिया हटा दिया गया' : 'Media deleted');
        fetchBlogMedia();
      } else {
        toast.error(isHi ? 'मीडिया हटाने में विफल' : 'Failed to delete media');
      }
    } catch (e) {
      toast.error(isHi ? 'मीडिया हटाने में त्रुटि' : 'Error deleting media');
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
    if (!dailyFile) return toast.error(isHi ? 'कृपया एक फ़ाइल चुनें' : 'Please select a file');
    if (!dailyDate) return toast.error(isHi ? 'कृपया एक तिथि चुनें' : 'Please select a date');

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
        toast.success(isHi ? 'दैनिक कार्य सफलतापूर्वक अपलोड हो गया' : 'Daily work uploaded successfully');
        setDailyFile(null);
        setDailyDate('');
        setDailyDesc('');
        fetchDailyWorks();
      } else {
        const err = await res.json();
        toast.error(err.error || (isHi ? 'अपलोड विफल रहा' : 'Upload failed'));
      }
    } catch (e) {
      toast.error(isHi ? 'अपलोड के दौरान कोई त्रुटि हुई' : 'An error occurred during upload');
    } finally {
      setDailyUploading(false);
    }
  };

  const handleDailyDelete = async (id: String) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/media/daily-work/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(isHi ? 'कार्य प्रविष्टि हटा दी गई' : 'Work entry deleted');
        fetchDailyWorks();
      } else {
        toast.error(isHi ? 'कार्य प्रविष्टि हटाने में विफल' : 'Failed to delete work entry');
      }
    } catch (e) {
      toast.error(isHi ? 'कार्य प्रविष्टि हटाने में त्रुटि' : 'Error deleting work entry');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-amber-500" />
          {isHi ? 'मीडिया और दैनिक कार्य' : 'Media & Daily Work'}
        </h1>
        <p className="text-slate-500 text-sm">
          {isHi ? 'लैंडिंग पेज के ब्लॉग सेक्शन और नए दैनिक कार्य कैलेंडर सेक्शन के लिए फ़ोटो और वीडियो प्रबंधित करें।' : 'Manage photos and videos for the landing page Blogs section and the new Daily Work calendar section.'}
        </p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('blog')}
          className={`py-2 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'blog' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-navy-700'
          }`}
        >
          {isHi ? 'ब्लॉग मीडिया' : 'Blogs Media'}
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`py-2 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'daily' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-navy-700'
          }`}
        >
          {isHi ? 'दैनिक कार्य अपडेट' : 'Daily Work Updates'}
        </button>
      </div>

      {activeTab === 'blog' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isHi ? 'ब्लॉग गैलरी में अपलोड करें' : 'Upload to Blogs Gallery'}</CardTitle>
              <CardDescription>{isHi ? 'फ़ोटो या वीडियो अपलोड करें। ये होमपेज पर ब्लॉग सेक्शन में सीधे दिखाई देंगे।' : 'Upload photos or videos. These will appear directly in the Blogs section on the homepage.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBlogUpload} className="flex flex-col gap-6">
                <div className="w-full">
                  <Label>{isHi ? 'फ़ोटो / वीडियो / दस्तावेज़' : 'Photo / Video / Document'}</Label>
                  <label htmlFor="blog-file" className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">{isHi ? 'अपलोड करने के लिए क्लिक करें' : 'Click to upload'}</span> {isHi ? 'या ड्रैग और ड्रॉप करें' : 'or drag and drop'}</p>
                      <p className="text-xs text-slate-500">SVG, PNG, JPG, MP4, PDF, DOCX ({isHi ? 'अधिकतम 50MB' : 'MAX. 50MB'})</p>
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
                  {blogUploading ? (isHi ? 'अपलोड हो रहा है...' : 'Uploading...') : (isHi ? 'अपलोड करें' : 'Upload')}
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
                    <a href={media.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{isHi ? 'फ़ाइल देखें' : 'View File'}</a>
                  </div>
                ) : (
                  <img src={media.url} alt="Blog media" className="w-full h-full object-cover" />
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-red-100 text-red-600">
                        <Trash2 className="w-6 h-6" />
                      </AlertDialogMedia>
                      <AlertDialogTitle>{isHi ? 'मीडिया हटाएं?' : 'Delete media?'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {isHi ? 'यह ब्लॉग गैलरी से इस मीडिया को स्थायी रूप से हटा देगा। यह कार्रवाई पूर्ववत नहीं की जा सकती।' : 'This will permanently delete this media from the blog gallery. This action cannot be undone.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{isHi ? 'रद्द करें' : 'Cancel'}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleBlogDelete(media.id)} className="bg-red-600 hover:bg-red-700 text-white">{isHi ? 'हटाएं' : 'Delete'}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
            {blogMedia.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 border border-dashed rounded-lg bg-slate-50">
                {isHi ? 'अभी तक कोई मीडिया अपलोड नहीं किया गया है।' : 'No media uploaded yet.'}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'daily' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isHi ? 'दैनिक कार्य जोड़ें' : 'Add Daily Work'}</CardTitle>
              <CardDescription>{isHi ? 'एक छोटे विवरण के साथ किसी विशिष्ट तिथि के लिए एक फोटो/वीडियो अपलोड करें। यह होमपेज पर कैलेंडर के बगल में दिखाई देगा।' : 'Upload a photo/video for a specific date with a short description. This will appear on the homepage next to the calendar.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDailyUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isHi ? 'फ़ोटो / वीडियो / दस्तावेज़' : 'Photo / Video / Document'}</Label>
                    <label htmlFor="daily-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 mb-2 text-slate-400" />
                        <p className="text-xs text-slate-500 font-semibold">{isHi ? 'फ़ाइल अपलोड करने के लिए क्लिक करें' : 'Click to upload file'}</p>
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
                    <Label htmlFor="daily-date">{isHi ? 'दिनांक' : 'Date'}</Label>
                    <Input 
                      id="daily-date" 
                      type="date" 
                      value={dailyDate}
                      onChange={(e) => setDailyDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily-desc">{isHi ? 'संक्षिप्त विवरण' : 'Short Description'}</Label>
                  <Textarea 
                    id="daily-desc" 
                    placeholder={isHi ? 'इस तिथि पर किए गए कार्य के बारे में विवरण दर्ज करें...' : 'Enter details about the work done on this date...'}
                    value={dailyDesc}
                    onChange={(e) => setDailyDesc(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={dailyUploading} className="bg-navy-800 hover:bg-navy-700 w-full sm:w-auto">
                  <Upload className="w-4 h-4 mr-2" />
                  {dailyUploading ? (isHi ? 'अपलोड हो रहा है...' : 'Uploading...') : (isHi ? 'दैनिक कार्य सहेजें' : 'Save Daily Work')}
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
                    <p className="text-slate-700 text-sm">{work.description || (isHi ? 'कोई विवरण प्रदान नहीं किया गया।' : 'No description provided.')}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isHi ? 'हटाएं' : 'Delete'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogMedia className="bg-red-100 text-red-600">
                          <Trash2 className="w-6 h-6" />
                        </AlertDialogMedia>
                        <AlertDialogTitle>{isHi ? 'कार्य प्रविष्टि हटाएं?' : 'Delete work entry?'}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {isHi ? 'यह इस दैनिक कार्य अपडेट को स्थायी रूप से हटा देगा। यह कार्रवाई पूर्ववत नहीं की जा सकती।' : 'This will permanently delete this daily work update. This action cannot be undone.'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{isHi ? 'रद्द करें' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDailyDelete(work.id)} className="bg-red-600 hover:bg-red-700 text-white">{isHi ? 'हटाएं' : 'Delete'}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
            {dailyWorks.length === 0 && (
              <div className="py-12 text-center text-slate-500 border border-dashed rounded-lg bg-slate-50">
                {isHi ? 'अभी तक कोई दैनिक कार्य प्रविष्टियां नहीं हैं।' : 'No daily work entries yet.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
