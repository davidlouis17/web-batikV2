import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, Crop, RotateCw, RotateCcw, FlipHorizontal, RefreshCw, Check } from 'lucide-react';

interface ImageUploaderProps {
  id?: string;
  value: string; // The current base64 or photo URL
  onChange: (base64: string) => void;
  label?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export default function ImageUploader({
  id = 'image-uploader',
  value,
  onChange,
  label = 'Unggah Foto Klasik Batik',
  maxWidth = 600,
  maxHeight = 600
}: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for Cropping Editor
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '16:9' | 'free'>('1:1');
  const [isSavingCrop, setIsSavingCrop] = useState(false);

  // Drag states for panning
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [displayedSize, setDisplayedSize] = useState({ width: 0, height: 0 });

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar yang didukung!');
      return;
    }
    
    // Max 10MB original size to avoid browser crash
    if (file.size > 10 * 1024 * 1024) {
      setError('File terlalu besar! Maksimal ukuran file adalah 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (event.target?.result) {
        handleOpenCropper(event.target.result as string);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Gagal membaca file gambar.');
    };
  };

  const handleOpenCropper = (imageSrc: string) => {
    setImageToCrop(imageSrc);
    setZoom(1.0);
    setRotate(0);
    setFlipH(false);
    setOffset({ x: 0, y: 0 });
    setAspectRatio('1:1');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    setOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStartRef.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStartRef.current.x;
    const newY = touch.clientY - dragStartRef.current.y;
    setOffset({ x: newX, y: newY });
  };

  const handleCropperImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDisplayedSize({
      width: img.clientWidth,
      height: img.clientHeight
    });
  };

  const handleSaveCrop = () => {
    if (!imageToCrop) return;
    
    setIsSavingCrop(true);
    
    const img = new Image();
    img.src = imageToCrop;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        
        const targetWidth = maxWidth;
        let aspectFraction = 1;
        if (aspectRatio === '4:3') aspectFraction = 4/3;
        if (aspectRatio === '16:9') aspectFraction = 16/9;
        if (aspectRatio === 'free') {
          aspectFraction = displayedSize.width / (displayedSize.height || 1);
        }
        
        const targetHeight = Math.round(targetWidth / aspectFraction);
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Gagal membuat context canvas.');
          setIsSavingCrop(false);
          return;
        }

        // Fill background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Calculate translation scaling
        const refWidth = displayedSize.width || 320;
        const displayToCanvasScale = targetWidth / refWidth;

        // 1. Center of canvas
        ctx.translate(targetWidth / 2, targetHeight / 2);
        
        // 2. User offset (panning)
        ctx.translate(offset.x * displayToCanvasScale, offset.y * displayToCanvasScale);
        
        // 3. Rotation
        ctx.rotate((rotate * Math.PI) / 180);
        
        // 4. Scaling (handles mirror)
        const finalScaleX = zoom * (flipH ? -1 : 1) * displayToCanvasScale;
        const finalScaleY = zoom * displayToCanvasScale;
        ctx.scale(finalScaleX, finalScaleY);
        
        // 5. Draw image centered
        ctx.drawImage(
          img, 
          -displayedSize.width / 2, 
          -displayedSize.height / 2, 
          displayedSize.width, 
          displayedSize.height
        );
        
        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        onChange(croppedBase64);
        setImageToCrop(null); // Close crop modal
      } catch (err) {
        console.error(err);
        setError('Gagal memproses pangkasan foto.');
      } finally {
        setIsSavingCrop(false);
      }
    };
    img.onerror = () => {
      setError('Gagal memuat visual gambar untuk cropping.');
      setIsSavingCrop(false);
    };
  };

  const handleResetCrop = () => {
    setZoom(1.0);
    setRotate(0);
    setFlipH(false);
    setOffset({ x: 0, y: 0 });
  };

  // Viewport responsive style values
  let viewportHeight = '320px';
  if (aspectRatio === '4:3') {
    viewportHeight = '240px';
  } else if (aspectRatio === '16:9') {
    viewportHeight = '180px';
  }

  return (
    <div className="space-y-2">
      {label && (
        <span className="block text-xs font-semibold text-slate-600 tracking-wide uppercase">
          {label}
        </span>
      )}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-slate-50 flex items-center justify-center">
          <img 
            src={value} 
            alt="Uploaded preview" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition duration-500" 
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenCropper(value)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase shadow-md flex items-center gap-1 transition animate-in zoom-in duration-150"
            >
              <Crop className="w-3.5 h-3.5" /> PANGKAS
            </button>
            <button
              type="button"
              onClick={triggerSelect}
              className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase shadow-md flex items-center gap-1 transition text-slate-850"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-850" /> GANTI
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase shadow-md flex items-center gap-1 transition"
            >
              <X className="w-3.5 h-3.5" /> HAPUS
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[140px] ${
            isDragActive 
              ? 'border-batik-primary bg-rose-50/20' 
              : 'border-slate-300 hover:border-batik-primary/60 hover:bg-slate-50/50'
          }`}
        >
          <div className="space-y-2 flex flex-col items-center">
            <div className="p-3 bg-rose-50 rounded-full text-batik-primary animate-pulse">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-700">Seret & lepas foto di sini, atau klik untuk memilih</p>
              <p className="text-[10px] text-slate-400">Tekan berkas untuk memotong (Mendukung JPG, PNG, WebP)</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <span className="block text-[11px] text-red-600 font-semibold">{error}</span>
      )}

      <input
        id={id}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* --- PREMIUM COMPREHENSIVE IMAGE CROP MODAL --- */}
      {imageToCrop && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full flex flex-col md:flex-row shadow-2xl overflow-hidden font-sans text-xs text-slate-100 animate-in fade-in duration-200">
            
            {/* LEFT SIDE: VIEWPORT AND INTERACTIVE PREVIEW */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/30">
              <div className="w-full text-center mb-4">
                <span className="text-[10px] tracking-widest text-[#B38E5D] font-bold uppercase">AKSI PENYUNTINGAN</span>
                <h3 className="font-serif font-bold text-lg text-white mt-0.5">Sesuaikan Bingkai & Fokus Foto</h3>
                <p className="text-[10px] text-slate-400 mt-1">Geser gambar, putar, atau perbesar layar untuk hasil pangkasan terbaik.</p>
              </div>

              {/* Viewport Box */}
              <div 
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: viewportHeight,
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#020617', // slate-950
                  border: '2.5px solid #ef4444', // red-500 border for high contrast crop zone
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="select-none relative shadow-xl cursor-move"
              >
                {/* Visual Gridlines Rule of Thirds */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-20">
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/25"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-b border-white/25"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/25"></div>
                  <div className="border-r border-white/20"></div>
                  <div className="border-r border-white/25"></div>
                  <div></div>
                </div>

                {/* Cropping Interactive Image */}
                <img
                  src={imageToCrop}
                  alt="Arahkan cropping"
                  draggable={false}
                  onLoad={handleCropperImageLoad}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotate}deg) scale(${zoom * (flipH ? -1 : 1)}, ${zoom})`,
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  className="select-none"
                />
              </div>

              <div className="mt-4 text-[10px] text-[#B38E5D] bg-[#B38E5D]/10 border border-[#B38E5D]/20 rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Tekan & seret gambar di dalam bingkai merah di atas untuk memindahkan titik fokus.</span>
              </div>
            </div>

            {/* RIGHT SIDE: CONTROLLERS AND DECISION BAR */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-slate-900 border-t md:border-t-0 border-slate-800">
              <div className="space-y-6">
                
                {/* Zoom range controller */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300">Skala Zoom</span>
                    <span className="text-white font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>1.0x (Normal)</span>
                    <span>2.0x</span>
                    <span>3.0x (Maksimum)</span>
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="space-y-2.5">
                  <span className="block text-slate-300 font-semibold">Rasio Aspek Potongan</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('1:1')}
                      className={`py-2 px-3 rounded-lg border text-left transition flex flex-col justify-between ${
                        aspectRatio === '1:1' 
                          ? 'border-amber-500 bg-amber-500/10 text-white font-bold' 
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px]">1:1 Persegi</span>
                      <span className="text-[9px] opacity-70 font-mono">Foto Produk</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('4:3')}
                      className={`py-2 px-3 rounded-lg border text-left transition flex flex-col justify-between ${
                        aspectRatio === '4:3' 
                          ? 'border-amber-500 bg-amber-500/10 text-white font-bold' 
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px]">4:3 Klasik</span>
                      <span className="text-[9px] opacity-70 font-mono">Galeri/Event</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`py-2 px-3 rounded-lg border text-left transition flex flex-col justify-between ${
                        aspectRatio === '16:9' 
                          ? 'border-amber-500 bg-amber-500/10 text-white font-bold' 
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px]">16:9 Banner</span>
                      <span className="text-[9px] opacity-70 font-mono">Foto Utama</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('free')}
                      className={`py-2 px-3 rounded-lg border text-left transition flex flex-col justify-between ${
                        aspectRatio === 'free' 
                          ? 'border-amber-500 bg-amber-500/10 text-white font-bold' 
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px]">Bebas (Asli)</span>
                      <span className="text-[9px] opacity-70 font-mono">Bidang Asli</span>
                    </button>
                  </div>
                </div>

                {/* Transform features (Rotate & Flip) */}
                <div className="space-y-2.5">
                  <span className="block text-slate-300 font-semibold">Manipulasi Orientasi</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRotate((prev) => (prev - 90 + 360) % 360)}
                      className="flex-1 py-2 px-2 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-white transition flex items-center justify-center gap-1.5"
                      title="Putar Berlawanan Jarum Jam"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                      <span>-90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotate((prev) => (prev + 90) % 360)}
                      className="flex-1 py-2 px-2 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-white transition flex items-center justify-center gap-1.5"
                      title="Putar Sesuai Jarum Jam"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                      <span>+90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipH(!flipH)}
                      className={`flex-1 py-2 px-2 rounded-lg border transition flex items-center justify-center gap-1.5 ${
                        flipH 
                          ? 'border-amber-500 bg-amber-500/10 text-white'
                          : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                      title="Balik Horisontal"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5 text-amber-500" />
                      <span>Cermin</span>
                    </button>
                  </div>
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={handleResetCrop}
                  className="w-full py-2 bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg flex items-center justify-center gap-1.5 transition text-[11px]"
                >
                  <RefreshCw className="w-3 h-3 text-amber-500" />
                  <span>Atur Ulang Posisi Gambar</span>
                </button>

              </div>

              {/* Confirm / Cancel Panel */}
              <div className="flex gap-3 pt-6 border-t border-slate-800/60 mt-6 md:mt-0">
                <button
                  type="button"
                  onClick={() => setImageToCrop(null)}
                  disabled={isSavingCrop}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl transition text-[11px]"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={handleSaveCrop}
                  disabled={isSavingCrop}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-[11px] uppercase"
                >
                  {isSavingCrop ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SIMPAN HASIL</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
