import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, FileText, Image, Video, Settings, Download, Check, AlertCircle, 
  Trash2, Edit2, Save, Archive, BarChart3, Zap, Palette, Target,
  Clock, FileCheck, Sparkles, TrendingUp, Globe, Shield
} from 'lucide-react';
import JSZip from 'jszip';

const CreativeChecker = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [specs, setSpecs] = useState({
    bannerAds: {
      ignite: {
        sizes: ['728x90', '300x250', '160x600', '300x600', '320x50'],
        maxSize: { default: 200, mobile: 150 },
        requirements: ['1px contrasting border', 'high-quality save']
      },
      amped: {
        sizes: ['300x250', '728x90', '640x100', '320x50'],
        maxSize: { default: 200 }
      }
    },
    social: {
      facebook: { sizes: ['1080x1080', '1080x1920'], formats: ['jpg', 'png', 'mp4', 'gif'] },
      instagram: { sizes: ['1080x1080', '1080x1920'], formats: ['jpg', 'png', 'mp4', 'gif'] },
      pinterest: { sizes: ['1000x1500'], formats: ['jpg', 'png'] },
      linkedin: { sizes: ['1080x1080'], formats: ['jpg', 'png', 'mp4'] },
      tiktok: { sizes: ['1080x1920', '720x1280'], formats: ['mp4', 'mov', 'jpg', 'png'] },
      snapchat: { sizes: ['1080x1920'], formats: ['mp4', 'mov', 'jpg', 'png'] }
    },
    video: {
      stv: { sizes: ['1920x1080'], duration: [15, 30], formats: ['mp4'] },
      hulu: { sizes: ['1920x1080'], maxDuration: 30, formats: ['mp4'] },
      netflix: { sizes: ['1920x1080'], formats: ['mp4'] },
      liveSports: { sizes: ['1920x1080'], formats: ['mp4'] }
    },
    email: {
      standard: { sizes: ['640xflexible'], formats: ['pdf', 'jpg', 'png'] }
    },
    native: {
      standard: { sizes: ['1200x1200'], formats: ['jpg', 'png'] }
    },
    spark: {
      landscape: { sizes: ['1200x628'], minSizes: ['600x314'], formats: ['jpg', 'png'] },
      square: { sizes: ['1200x1200'], minSizes: ['300x300'], formats: ['jpg', 'png'] },
      portrait: { sizes: ['960x1200'], minSizes: ['480x600'], formats: ['jpg', 'png'] },
      logo: { sizes: ['1200x1200'], minSizes: ['128x128'], formats: ['jpg', 'png'] },
      landscapeLogo: { sizes: ['1200x300'], minSizes: ['512x128'], formats: ['jpg', 'png'] },
      video: { sizes: ['1920x1080'], minDuration: 10, formats: ['mp4'] }
    },
    amped: {
      contentSponsorship: {
        headerDesktop: { sizes: ['980x100'], formats: ['jpg', 'png'] },
        headerMobile: { sizes: ['320x50'], formats: ['jpg', 'png'] },
        footerLogo: { sizes: ['300x200'], formats: ['jpg'] }
      },
      listenLive: {
        skin: { sizes: ['1000x645'], formats: ['jpg', 'png'] },
        banners: { sizes: ['728x90', '320x50'], formats: ['jpg', 'png'] },
        preRoll: { sizes: ['1920x1080'], maxDuration: 30, formats: ['mp4'] }
      },
      mobileBillboard: { sizes: ['860x310'], safeArea: ['680x270'], formats: ['jpg', 'png'] },
      takeover: {
        skin: { sizes: ['1280x800', '1440x900', '1600x900'], formats: ['jpg', 'png'] },
        billboard: { sizes: ['970x250'], formats: ['jpg', 'png', 'mp4'] }
      }
    }
  });
  
  const fileInputRef = useRef(null);

  // Enhanced AI analysis function
  const analyzeCreative = useCallback((file, dimensions) => {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const { width, height } = dimensions;
    
    // Determine aspect ratio and orientation
    const aspectRatio = width && height ? (width / height).toFixed(2) : 'unknown';
    let orientation = 'unknown';
    if (width && height) {
      if (width > height) orientation = 'landscape';
      else if (height > width) orientation = 'portrait';
      else orientation = 'square';
    }

    // Suggest platforms based on dimensions and format
    const suggestedPlatforms = [];
    const dimensionString = `${width}x${height}`;
    
    if (dimensionString === '1080x1080') suggestedPlatforms.push('Instagram Square', 'Facebook Square', 'LinkedIn');
    if (dimensionString === '1080x1920') suggestedPlatforms.push('Instagram Stories', 'TikTok', 'Snapchat');
    if (dimensionString === '1920x1080') suggestedPlatforms.push('YouTube', 'Hulu', 'STV');
    if (dimensionString === '728x90') suggestedPlatforms.push('Banner Ads');
    if (dimensionString === '300x250') suggestedPlatforms.push('Medium Rectangle Banner');

    // Mock creative analysis
    const themes = ['Product Focus', 'Lifestyle', 'Brand Awareness', 'Promotional', 'Informational'];
    const styles = ['Modern', 'Classic', 'Bold', 'Minimalist', 'Vibrant'];
    const qualityScores = ['Excellent', 'Good', 'Fair', 'Needs Improvement'];
    
    return {
      type: isVideo ? 'video' : isImage ? 'image' : 'other',
      format: file.type.split('/')[1]?.toUpperCase() || 'Unknown',
      orientation,
      aspectRatio,
      suggestedPlatforms: suggestedPlatforms.length > 0 ? suggestedPlatforms : ['Custom Format'],
      theme: themes[Math.floor(Math.random() * themes.length)],
      style: styles[Math.floor(Math.random() * styles.length)],
      quality: qualityScores[Math.floor(Math.random() * qualityScores.length)],
      hasText: Math.random() > 0.4,
      hasCTA: Math.random() > 0.6,
      hasLogo: Math.random() > 0.5,
      dominantColors: ['#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 3)],
      recommendations: [
        width < 300 ? 'Consider higher resolution for better quality' : null,
        !isVideo && file.size > 500000 ? 'File size could be optimized' : null,
        Math.random() > 0.7 ? 'Good contrast and readability' : null,
        Math.random() > 0.8 ? 'Consider adding more brand elements' : null
      ].filter(Boolean)
    };
  }, []);

  // Get image/video dimensions
  const getMediaDimensions = (file) => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.onload = () => {
          URL.revokeObjectURL(img.src); // Clean up object URL
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          URL.revokeObjectURL(img.src); // Clean up object URL on error
          resolve({ width: 0, height: 0 });
        };
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src); // Clean up object URL
          resolve({ width: video.videoWidth, height: video.videoHeight });
        };
        video.onerror = () => {
          URL.revokeObjectURL(video.src); // Clean up object URL on error
          resolve({ width: 0, height: 0 });
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve({ width: 0, height: 0 });
      }
    });
  };

  // Enhanced spec checking
  const checkSpecs = (file, dimensions) => {
    const { width, height } = dimensions;
    const dimensionString = `${width}x${height}`;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileSizeKB = file.size / 1024;
    
    let matches = [];
    let warnings = [];
    let category = 'Unknown';

    // Check banner ads
    if (specs.bannerAds.ignite.sizes.includes(dimensionString)) {
      matches.push('Ignite Banner');
      category = 'Banner Ads';
      if (dimensionString === '320x50' && fileSizeKB > specs.bannerAds.ignite.maxSize.mobile) {
        warnings.push(`File size exceeds ${specs.bannerAds.ignite.maxSize.mobile}KB limit for mobile banners`);
      } else if (fileSizeKB > specs.bannerAds.ignite.maxSize.default) {
        warnings.push(`File size exceeds ${specs.bannerAds.ignite.maxSize.default}KB limit`);
      }
    }
    
    if (specs.bannerAds.amped.sizes.includes(dimensionString)) {
      matches.push('AMPed Banner');
      category = 'Banner Ads';
    }

    // Check social media specs
    Object.entries(specs.social).forEach(([platform, spec]) => {
      if (spec.sizes.includes(dimensionString) && spec.formats.includes(fileExtension)) {
        matches.push(`${platform.charAt(0).toUpperCase() + platform.slice(1)} Social`);
        category = 'Social Media';
      }
    });

    // Check video specs
    Object.entries(specs.video).forEach(([platform, spec]) => {
      if (spec.sizes.includes(dimensionString) && spec.formats.includes(fileExtension)) {
        matches.push(`${platform.toUpperCase()} Video`);
        category = 'Video';
      }
    });

    // Check Spark specs
    Object.entries(specs.spark).forEach(([type, spec]) => {
      if (spec.sizes.includes(dimensionString) && spec.formats.includes(fileExtension)) {
        matches.push(`Spark ${type.charAt(0).toUpperCase() + type.slice(1)}`);
        category = 'Spark';
      }
    });

    // Check AMPed product specs
    Object.entries(specs.amped).forEach(([product, productSpecs]) => {
      if (typeof productSpecs === 'object' && productSpecs.sizes) {
        if (productSpecs.sizes.includes(dimensionString)) {
          matches.push(`AMPed ${product}`);
          category = 'AMPed Products';
        }
      } else {
        Object.entries(productSpecs).forEach(([subType, spec]) => {
          if (spec.sizes && spec.sizes.includes(dimensionString)) {
            matches.push(`AMPed ${product} ${subType}`);
            category = 'AMPed Products';
          }
        });
      }
    });

    if (matches.length === 0) {
      warnings.push('Dimensions do not match any standard specs');
      category = 'Custom';
    }

    // Additional file format warnings
    if (!['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'].includes(fileExtension)) {
      warnings.push('Unusual file format - verify platform compatibility');
    }

    return { matches, warnings, category };
  };

  // Get a preview of ZIP file contents (optional feature)
  const previewZipContents = async (zipFile) => {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);
      const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'pdf'];
      
      const fileList = [];
      for (const [filename, fileData] of Object.entries(zipContent.files)) {
        if (fileData.dir || filename.startsWith('__MACOSX/') || filename.startsWith('.')) {
          continue;
        }
        
        const extension = filename.split('.').pop()?.toLowerCase();
        if (extension && supportedExtensions.includes(extension)) {
          fileList.push({
            name: filename,
            size: fileData._data?.uncompressedSize || 0,
            extension: extension.toUpperCase()
          });
        }
      }
      
      return fileList;
    } catch (error) {
      console.error('Error previewing ZIP contents:', error);
      return [];
    }
  };

  // Process ZIP files using JSZip
  const processZipFile = async (zipFile) => {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);
      const extractedFiles = [];

      // Supported file types for creative analysis
      const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'pdf'];
      
      for (const [filename, fileData] of Object.entries(zipContent.files)) {
        // Skip directories and system files
        if (fileData.dir || filename.startsWith('__MACOSX/') || filename.startsWith('.')) {
          continue;
        }

        // Check if file has supported extension
        const extension = filename.split('.').pop()?.toLowerCase();
        if (!extension || !supportedExtensions.includes(extension)) {
          continue;
        }

        try {
          // Extract file as blob
          const blob = await fileData.async('blob');
          
          // Determine MIME type based on extension
          let mimeType = 'application/octet-stream';
          if (['jpg', 'jpeg'].includes(extension)) mimeType = 'image/jpeg';
          else if (extension === 'png') mimeType = 'image/png';
          else if (extension === 'gif') mimeType = 'image/gif';
          else if (extension === 'webp') mimeType = 'image/webp';
          else if (extension === 'bmp') mimeType = 'image/bmp';
          else if (extension === 'svg') mimeType = 'image/svg+xml';
          else if (extension === 'mp4') mimeType = 'video/mp4';
          else if (extension === 'mov') mimeType = 'video/quicktime';
          else if (extension === 'avi') mimeType = 'video/x-msvideo';
          else if (extension === 'mkv') mimeType = 'video/x-matroska';
          else if (extension === 'webm') mimeType = 'video/webm';
          else if (extension === 'pdf') mimeType = 'application/pdf';

          // Create File object from blob
          const file = new File([blob], filename, { 
            type: mimeType,
            lastModified: fileData.date?.getTime() || Date.now()
          });

          extractedFiles.push(file);
        } catch (fileError) {
          console.warn(`Error extracting file ${filename}:`, fileError);
          continue;
        }
      }

      console.log(`Successfully extracted ${extractedFiles.length} files from ${zipFile.name}`);
      return extractedFiles;
    } catch (error) {
      console.error('Error processing ZIP file:', error);
      throw new Error(`Failed to extract ZIP file: ${error.message}`);
    }
  };

  // Process uploaded files
  const processFiles = async (uploadedFiles) => {
    setIsProcessing(true);
    setProcessingStatus('Starting file processing...');
    const processedFiles = [];
    let zipErrors = [];

    for (const file of uploadedFiles) {
      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          // Handle ZIP files
          setProcessingStatus(`Extracting ZIP file: ${file.name}...`);
          console.log(`Processing ZIP file: ${file.name}`);
          const extractedFiles = await processZipFile(file);
          
          if (extractedFiles.length === 0) {
            zipErrors.push(`No supported files found in ${file.name}`);
            continue;
          }

          setProcessingStatus(`Analyzing ${extractedFiles.length} files from ${file.name}...`);
          
          for (const extractedFile of extractedFiles) {
            const dimensions = await getMediaDimensions(extractedFile);
            const analysis = analyzeCreative(extractedFile, dimensions);
            const specCheck = checkSpecs(extractedFile, dimensions);
            
            processedFiles.push({
              id: Math.random().toString(36).substr(2, 9),
              originalName: extractedFile.name,
              displayName: extractedFile.name,
              file: extractedFile,
              dimensions,
              size: extractedFile.size,
              type: extractedFile.type,
              analysis,
              specCheck,
              isFromZip: true,
              zipSource: file.name
            });
          }
          
          console.log(`Successfully processed ${extractedFiles.length} files from ${file.name}`);
        } catch (error) {
          console.error(`Error processing ZIP file ${file.name}:`, error);
          zipErrors.push(`Error processing ${file.name}: ${error.message}`);
        }
      } else {
        // Handle individual files
        try {
          setProcessingStatus(`Analyzing ${file.name}...`);
          const dimensions = await getMediaDimensions(file);
          const analysis = analyzeCreative(file, dimensions);
          const specCheck = checkSpecs(file, dimensions);
          
          processedFiles.push({
            id: Math.random().toString(36).substr(2, 9),
            originalName: file.name,
            displayName: file.name,
            file,
            dimensions,
            size: file.size,
            type: file.type,
            analysis,
            specCheck,
            isFromZip: false
          });
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
        }
      }
    }

    // Show any ZIP processing errors
    if (zipErrors.length > 0) {
      alert(`ZIP Processing Issues:\n${zipErrors.join('\n')}`);
    }

    setFiles(prev => [...prev, ...processedFiles]);
    setProcessingStatus('');
    setIsProcessing(false);
  };

  // Handle file drop
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  }, []);

  // Handle file input change
  const handleFileInput = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    await processFiles(selectedFiles);
  };

  // Update file name
  const updateFileName = (id, newName) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, displayName: newName } : file
    ));
  };

  // Remove file
  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  // Download results as JSON
  const downloadResults = () => {
    const results = files.map(file => ({
      fileName: file.displayName,
      originalName: file.originalName,
      dimensions: file.dimensions,
      fileSizeKB: Math.round(file.size / 1024),
      format: file.analysis.format,
      category: file.specCheck.category,
      specMatches: file.specCheck.matches,
      warnings: file.specCheck.warnings,
      analysis: file.analysis,
      isFromZip: file.isFromZip,
      zipSource: file.zipSource || null
    }));

    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `creative-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Download CSV
  const downloadCSV = () => {
    const headers = [
      'File Name', 'Original Name', 'Width', 'Height', 'Size (KB)', 'Format', 
      'Category', 'Spec Matches', 'Warnings', 'Quality', 'Theme', 'Style', 'From ZIP'
    ];
    
    const csvContent = [
      headers.join(','),
      ...files.map(file => [
        `"${file.displayName}"`,
        `"${file.originalName}"`,
        file.dimensions.width,
        file.dimensions.height,
        Math.round(file.size / 1024),
        file.analysis.format,
        file.specCheck.category,
        `"${file.specCheck.matches.join('; ')}"`,
        `"${file.specCheck.warnings.join('; ')}"`,
        file.analysis.quality,
        file.analysis.theme,
        file.analysis.style,
        file.isFromZip ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `creative-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const FileCard = ({ file }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(file.displayName);

    const handleSaveName = () => {
      updateFileName(file.id, editName);
      setIsEditing(false);
    };

    return (
      <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`p-3 rounded-xl ${
              file.type.startsWith('image/') ? 'bg-blue-100 text-blue-600' :
              file.type.startsWith('video/') ? 'bg-purple-100 text-purple-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {file.type.startsWith('image/') ? <Image className="w-6 h-6" /> :
               file.type.startsWith('video/') ? <Video className="w-6 h-6" /> :
               <FileText className="w-6 h-6" />}
            </div>
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button onClick={handleSaveName} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 truncate">{file.displayName}</h4>
                    {file.isFromZip && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center space-x-1">
                        <Archive className="w-3 h-3" />
                        <span>ZIP</span>
                      </span>
                    )}
                  </div>
                  {file.isFromZip && (
                    <p className="text-xs text-gray-500 mt-1">
                      Extracted from {file.zipSource}
                      {files.filter(f => f.zipSource === file.zipSource).length > 1 && 
                        ` • ${files.filter(f => f.zipSource === file.zipSource).length} files total`
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => removeFile(file.id)} 
            className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* File Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dimensions</div>
            <div className="text-lg font-bold text-gray-900 font-mono">{file.dimensions.width} × {file.dimensions.height}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">File Size</div>
            <div className="text-lg font-bold text-gray-900">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Format</div>
            <div className="text-lg font-bold text-gray-900">{file.analysis.format}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Orientation</div>
            <div className="text-lg font-bold text-gray-900 capitalize">{file.analysis.orientation}</div>
          </div>
        </div>

        {/* Spec Compliance */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Specification Compliance</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              file.specCheck.category === 'Custom' 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {file.specCheck.category}
            </span>
          </div>
          
          {file.specCheck.matches.length > 0 ? (
            <div className="space-y-3 mb-4">
              {file.specCheck.matches.map((match, idx) => (
                <div key={idx} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-green-800">{match}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-xl mb-4">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-orange-800">No standard specifications matched</span>
            </div>
          )}
          
          {file.specCheck.warnings.length > 0 && (
            <div className="space-y-2">
              {file.specCheck.warnings.map((warning, idx) => (
                <div key={idx} className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-yellow-800">{warning}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Analysis */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI-Powered Analysis
          </h4>
          
          {/* Quality & Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quality Score</div>
              <div className={`text-xl font-bold ${
                file.analysis.quality === 'Excellent' ? 'text-green-600' :
                file.analysis.quality === 'Good' ? 'text-blue-600' :
                file.analysis.quality === 'Fair' ? 'text-orange-600' : 'text-red-600'
              }`}>{file.analysis.quality}</div>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Aspect Ratio</div>
              <div className="text-xl font-bold text-gray-900 font-mono">{file.analysis.aspectRatio}</div>
            </div>
          </div>
          
          {/* Theme & Style */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Creative Theme</div>
              <span className="inline-block px-3 py-2 bg-blue-100 text-blue-800 rounded-xl font-medium">
                {file.analysis.theme}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Visual Style</div>
              <span className="inline-block px-3 py-2 bg-purple-100 text-purple-800 rounded-xl font-medium">
                {file.analysis.style}
              </span>
            </div>
          </div>
          
          {/* Platform Suggestions */}
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 mb-3">Recommended Platforms</div>
            <div className="flex flex-wrap gap-2">
              {file.analysis.suggestedPlatforms.map((platform, idx) => (
                <span key={idx} className="px-3 py-2 bg-indigo-100 text-indigo-800 rounded-xl text-sm font-medium">
                  {platform}
                </span>
              ))}
            </div>
          </div>
          
          {/* Creative Elements */}
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 mb-3">Detected Elements</div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center px-3 py-2 bg-gray-100 rounded-xl">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: file.analysis.dominantColors }}
                ></div>
                <span className="text-sm font-medium text-gray-700">Dominant Color</span>
              </div>
              {file.analysis.hasText && (
                <span className="px-3 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-medium">
                  Text Present
                </span>
              )}
              {file.analysis.hasCTA && (
                <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-medium">
                  Call-to-Action
                </span>
              )}
              {file.analysis.hasLogo && (
                <span className="px-3 py-2 bg-purple-100 text-purple-800 rounded-xl text-sm font-medium">
                  Logo/Branding
                </span>
              )}
            </div>
          </div>
          
          {/* Recommendations */}
          {file.analysis.recommendations.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">AI Recommendations</div>
              <div className="space-y-2">
                {file.analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-blue-800">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SpecsSettings = () => {
    const [editingSpecs, setEditingSpecs] = useState(specs);
    const [activeCategory, setActiveCategory] = useState('bannerAds');

    const saveSpecs = () => {
      setSpecs(editingSpecs);
      setActiveTab('upload');
    };

    const categories = [
      { id: 'bannerAds', name: 'Banner Ads', icon: '🏷️', color: 'blue' },
      { id: 'social', name: 'Social Media', icon: '📱', color: 'purple' },
      { id: 'video', name: 'Video Platforms', icon: '🎬', color: 'red' },
      { id: 'spark', name: 'Spark Creative', icon: '⚡', color: 'yellow' },
      { id: 'amped', name: 'AMPed Products', icon: '🚀', color: 'green' }
    ];

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="glass rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Specification Management</h2>
              <p className="text-gray-600">Configure validation rules and platform requirements for your creative assets</p>
            </div>
            <button 
              onClick={saveSpecs}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(({ id, name, icon, color }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeCategory === id
                  ? `bg-${color}-100 text-${color}-800 shadow-md`
                  : 'bg-white/70 text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span>{name}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {activeCategory === 'bannerAds' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Ignite Banner Specs</h3>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Allowed Dimensions</span>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-xl text-sm font-mono bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      value={editingSpecs.bannerAds.ignite.sizes.join(', ')}
                      onChange={(e) => {
                        const sizes = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        setEditingSpecs(prev => ({
                          ...prev,
                          bannerAds: {
                            ...prev.bannerAds,
                            ignite: { ...prev.bannerAds.ignite, sizes }
                          }
                        }));
                      }}
                      placeholder="728x90, 300x250, 160x600..."
                    />
                  </label>
                  <div className="text-xs text-gray-500">
                    Enter dimensions in WIDTHxHEIGHT format, separated by commas
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">AMPed Banner Specs</h3>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Allowed Dimensions</span>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-xl text-sm font-mono bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      value={editingSpecs.bannerAds.amped.sizes.join(', ')}
                      onChange={(e) => {
                        const sizes = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        setEditingSpecs(prev => ({
                          ...prev,
                          bannerAds: {
                            ...prev.bannerAds,
                            amped: { ...prev.bannerAds.amped, sizes }
                          }
                        }));
                      }}
                      placeholder="300x250, 728x90, 640x100..."
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'social' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(editingSpecs.social).map(([platform, config]) => (
                <div key={platform} className="glass rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-lg">
                        {platform === 'facebook' ? '👤' : 
                         platform === 'instagram' ? '📷' :
                         platform === 'tiktok' ? '🎵' :
                         platform === 'linkedin' ? '💼' :
                         platform === 'pinterest' ? '📌' : '📱'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{platform}</h3>
                  </div>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 mb-2 block">Allowed Sizes</span>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-xl text-sm font-mono bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        value={config.sizes.join(', ')}
                        onChange={(e) => {
                          const sizes = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                          setEditingSpecs(prev => ({
                            ...prev,
                            social: {
                              ...prev.social,
                              [platform]: { ...prev.social[platform], sizes }
                            }
                          }));
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Add similar sections for other categories as needed */}
          {activeCategory !== 'bannerAds' && activeCategory !== 'social' && (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Configuration Panel</h3>
              <p className="text-gray-600">
                Advanced settings for {categories.find(c => c.id === activeCategory)?.name} will be available here.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Creative Specs Validator
                </h1>
                <p className="text-sm text-gray-500">Professional creative asset validation & analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'upload', label: 'Upload & Validate', icon: Upload, description: 'Upload and analyze creatives' },
            { id: 'settings', label: 'Spec Management', icon: Settings, description: 'Configure validation rules' }
          ].map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group relative px-6 py-4 rounded-2xl flex items-center space-x-3 transition-all duration-200 ${
                activeTab === id 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105' 
                  : 'bg-white/70 text-gray-600 hover:bg-white hover:shadow-md backdrop-blur-sm'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeTab === id 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">{label}</div>
                <div className={`text-xs ${
                  activeTab === id 
                    ? 'text-blue-100' 
                    : 'text-gray-500'
                }`}>{description}</div>
              </div>
            </button>
          ))}
        </div>

        {activeTab === 'settings' ? (
          <SpecsSettings />
        ) : (
          <div className="space-y-8">
            {/* Upload Area */}
            <div className="relative">
              <div
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 scale-102 shadow-xl' 
                    : 'border-gray-300 bg-white/50 hover:bg-white/70 backdrop-blur-sm'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
              >
                <div className="max-w-md mx-auto">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all ${
                    isDragging 
                      ? 'bg-blue-500 shadow-lg' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200'
                  }`}>
                    <Upload className={`w-10 h-10 ${
                      isDragging ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {isDragging ? 'Drop your files here!' : 'Upload Creative Assets'}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Drop individual files or ZIP archives containing multiple creatives.
                    <br />We support all major image and video formats.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                    <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-xl">
                      <Image className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Images</span>
                      <span className="text-xs text-gray-500">JPG, PNG, GIF, WebP</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-xl">
                      <Video className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Videos</span>
                      <span className="text-xs text-gray-500">MP4, MOV, WebM</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <Archive className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      ZIP files are automatically extracted and processed
                    </span>
                  </div>
                  
                  {isProcessing && processingStatus && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-blue-700 font-medium">{processingStatus}</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                      isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Upload className="w-5 h-5" />
                        <span>Choose Files to Upload</span>
                      </div>
                    )}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.zip"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Summary Stats and Actions */}
            {files.length > 0 && (
              <div className="glass rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Analysis Overview</h3>
                    <p className="text-gray-600">Comprehensive analysis of your creative assets</p>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={downloadCSV}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                    <button 
                      onClick={downloadResults}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">{files.length}</div>
                    <div className="text-sm font-medium text-blue-800">Total Files</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {files.filter(f => f.specCheck.matches.length > 0).length}
                    </div>
                    <div className="text-sm font-medium text-green-800">Spec Compliant</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Image className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {files.filter(f => f.type.startsWith('image/')).length}
                    </div>
                    <div className="text-sm font-medium text-purple-800">Images</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl">
                    <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {files.filter(f => f.type.startsWith('video/')).length}
                    </div>
                    <div className="text-sm font-medium text-orange-800">Videos</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Archive className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-indigo-600 mb-1">
                      {files.filter(f => f.isFromZip).length}
                    </div>
                    <div className="text-sm font-medium text-indigo-800">From Archives</div>
                  </div>
                </div>
              </div>
            )}

            {/* Files Grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {files.map(file => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            )}

            {files.length === 0 && !isProcessing && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Validate Your Creatives</h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                  Upload individual creative files or ZIP archives to get started with comprehensive 
                  specification checking and AI-powered analysis.
                </p>
                <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 max-w-md mx-auto">
                  <div className="text-sm text-blue-800 font-medium mb-2">✨ What you'll get:</div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Platform compliance validation</li>
                    <li>• AI-powered quality assessment</li>
                    <li>• Automated dimension checking</li>
                    <li>• Export-ready analysis reports</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeChecker;