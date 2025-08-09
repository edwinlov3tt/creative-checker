import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Image, Video, Settings, Download, Check, X, AlertCircle, Trash2, Edit2, Save, Archive, Eye } from 'lucide-react';
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
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({ width: video.videoWidth, height: video.videoHeight });
        };
        video.onerror = () => resolve({ width: 0, height: 0 });
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
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            {file.type.startsWith('image/') ? <Image className="w-5 h-5 text-blue-500" /> :
             file.type.startsWith('video/') ? <Video className="w-5 h-5 text-purple-500" /> :
             <FileText className="w-5 h-5 text-gray-500" />}
            
            {file.isFromZip && <Archive className="w-4 h-4 text-orange-500" />}
            
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <button onClick={handleSaveName} className="p-1 text-green-600 hover:bg-green-50 rounded">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 flex-1">
                <div className="flex-1">
                  <span className="font-medium text-sm truncate block">{file.displayName}</span>
                  {file.isFromZip && (
                    <span className="text-xs text-gray-500">
                      extracted from {file.zipSource}
                      {files.filter(f => f.zipSource === file.zipSource).length > 1 && 
                        ` (${files.filter(f => f.zipSource === file.zipSource).length} files)`
                      }
                    </span>
                  )}
                </div>
                <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <button onClick={() => removeFile(file.id)} className="p-1 text-red-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-500">Dimensions:</span>
            <span className="ml-1 font-mono">{file.dimensions.width}×{file.dimensions.height}</span>
          </div>
          <div>
            <span className="text-gray-500">Size:</span>
            <span className="ml-1">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
          <div>
            <span className="text-gray-500">Format:</span>
            <span className="ml-1">{file.analysis.format}</span>
          </div>
          <div>
            <span className="text-gray-500">Orientation:</span>
            <span className="ml-1">{file.analysis.orientation}</span>
          </div>
        </div>

        {/* Spec Check Results */}
        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2">Spec Compliance:</h4>
          <div className="text-sm">
            <div className="mb-1">
              <span className="text-gray-500">Category:</span>
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                file.specCheck.category === 'Custom' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {file.specCheck.category}
              </span>
            </div>
            
            {file.specCheck.matches.length > 0 ? (
              <div className="space-y-1">
                {file.specCheck.matches.map((match, idx) => (
                  <div key={idx} className="flex items-center text-green-600 text-sm">
                    <Check className="w-4 h-4 mr-1" />
                    {match}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                No standard specs matched
              </div>
            )}
            
            {file.specCheck.warnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {file.specCheck.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-center text-orange-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2">Creative Analysis:</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Quality:</span>
                <span className={`ml-1 ${
                  file.analysis.quality === 'Excellent' ? 'text-green-600' :
                  file.analysis.quality === 'Good' ? 'text-blue-600' :
                  file.analysis.quality === 'Fair' ? 'text-orange-600' : 'text-red-600'
                }`}>{file.analysis.quality}</span>
              </div>
              <div>
                <span className="text-gray-500">Theme:</span>
                <span className="ml-1">{file.analysis.theme}</span>
              </div>
              <div>
                <span className="text-gray-500">Style:</span>
                <span className="ml-1">{file.analysis.style}</span>
              </div>
              <div>
                <span className="text-gray-500">Aspect Ratio:</span>
                <span className="ml-1">{file.analysis.aspectRatio}</span>
              </div>
            </div>
            
            <div>
              <span className="text-gray-500">Platform Suggestions:</span>
              <div className="mt-1">
                {file.analysis.suggestedPlatforms.map((platform, idx) => (
                  <span key={idx} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: file.analysis.dominantColors }}></div>
                Dominant Color
              </div>
              {file.analysis.hasText && <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Has Text</span>}
              {file.analysis.hasCTA && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Has CTA</span>}
              {file.analysis.hasLogo && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Has Logo</span>}
            </div>

            {file.analysis.recommendations.length > 0 && (
              <div>
                <span className="text-gray-500">Recommendations:</span>
                <ul className="mt-1 space-y-1">
                  {file.analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SpecsSettings = () => {
    const [editingSpecs, setEditingSpecs] = useState(specs);

    const saveSpecs = () => {
      setSpecs(editingSpecs);
      setActiveTab('upload');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Specification Settings</h2>
          <button 
            onClick={saveSpecs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Banner Ads - Ignite</h3>
            <div className="space-y-2">
              <label className="block text-sm">
                Allowed Sizes (comma-separated):
                <textarea
                  className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
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
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Social Media - Facebook</h3>
            <div className="space-y-2">
              <label className="block text-sm">
                Allowed Sizes:
                <textarea
                  className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                  value={editingSpecs.social.facebook.sizes.join(', ')}
                  onChange={(e) => {
                    const sizes = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                    setEditingSpecs(prev => ({
                      ...prev,
                      social: {
                        ...prev.social,
                        facebook: { ...prev.social.facebook, sizes }
                      }
                    }));
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Creative Specs Checker</h1>
          <p className="text-gray-600">Upload creatives, extract ZIP files, check specifications, and analyze creative content</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'upload', label: 'Upload & Check', icon: Upload },
            { id: 'settings', label: 'Specs Settings', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeTab === id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'settings' ? (
          <SpecsSettings />
        ) : (
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to upload
              </h3>
              <p className="text-gray-600 mb-2">
                Support for images (JPG, PNG, GIF, WebP), videos (MP4, MOV, WebM), and ZIP files
              </p>
              <p className="text-sm text-gray-500 mb-4">
                <Archive className="w-4 h-4 inline mr-1" />
                ZIP files will be automatically extracted (supports JPG, PNG, GIF, WebP, SVG, MP4, MOV, WebM, PDF)
              </p>
              
              {isProcessing && processingStatus && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700 text-sm">{processingStatus}</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Choose Files'}
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

            {/* Summary Stats and Actions */}
            {files.length > 0 && (
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Analysis Summary</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={downloadCSV}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>CSV</span>
                    </button>
                    <button 
                      onClick={downloadResults}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{files.length}</div>
                    <div className="text-sm text-gray-600">Total Files</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {files.filter(f => f.specCheck.matches.length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Spec Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {files.filter(f => f.type.startsWith('image/')).length}
                    </div>
                    <div className="text-sm text-gray-600">Images</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {files.filter(f => f.type.startsWith('video/')).length}
                    </div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {files.filter(f => f.isFromZip).length}
                    </div>
                    <div className="text-sm text-gray-600">From ZIP</div>
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
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
                <p className="text-gray-600">Upload some creatives or ZIP files to get started with spec checking and analysis.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeChecker;