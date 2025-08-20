import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, FileText, Image, Video, Settings, Download, Check, AlertCircle, 
  Trash2, Edit2, Save, Archive, Sparkles, Plus, Minus, ChevronDown, X, Search
} from 'lucide-react';
import JSZip from 'jszip';

const CreativeChecker = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedTactics, setSelectedTactics] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showCollectionManager, setShowCollectionManager] = useState(false);
  const [fileSortOrder, setFileSortOrder] = useState('default'); // 'default', 'compliant-first', 'non-compliant-first'
  const [specs, setSpecs] = useState({
    bannerAds: {
      ignite: {
        sizes: ['728x90', '300x250', '160x600', '300x600', '320x50'],
        maxSize: { default: 200, mobile: 150 },
        requirements: ['1px contrasting border', 'high-quality save'],
        sizeRequirements: {
          '728x90': { maxSizeKB: 200 },
          '300x250': { maxSizeKB: 200 },
          '160x600': { maxSizeKB: 200 },
          '300x600': { maxSizeKB: 200 },
          '320x50': { maxSizeKB: 150 }
        }
      },
      amped: {
        sizes: ['300x250', '728x90', '640x100', '320x50'],
        maxSize: { default: 200 },
        sizeRequirements: {
          '300x250': { maxSizeKB: 200 },
          '728x90': { maxSizeKB: 200 },
          '640x100': { maxSizeKB: 200 },
          '320x50': { maxSizeKB: 150 }
        }
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
  const dropdownRef = useRef(null);

  // Filename validation and sanitization
  const sanitizeFilename = (filename) => {
    // Remove invalid characters: < > : " / \ | ? *
    let sanitized = filename.replace(/[<>:"/\\|?*]/g, '');
    
    // Replace spaces with hyphens
    sanitized = sanitized.replace(/\s+/g, '-');
    
    // Remove leading/trailing spaces and periods
    sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '');
    
    // Ensure it's not empty
    if (!sanitized) {
      sanitized = 'untitled';
    }
    
    return sanitized;
  };

  // Validate filename input
  const validateFilename = (filename) => {
    const invalid = /[<>:"/\\|?*]/.test(filename);
    const startsEndsWithSpaceOrPeriod = /^[\s.]|[\s.]$/.test(filename);
    return !invalid && !startsEndsWithSpaceOrPeriod && filename.trim().length > 0;
  };

  // Get file collections based on folder structure
  const getFileCollections = () => {
    const collections = new Map();
    
    files.forEach(file => {
      // Skip any remaining system files that might have slipped through
      if (file.originalPath && (
          file.originalPath.includes('__MACOSX') ||
          file.originalPath.includes('.DS_Store') ||
          file.originalPath.includes('/._')
        )) {
        return; // Skip system files
      }
      
      if (file.isFromZip && file.originalPath && file.originalPath.includes('/')) {
        const parts = file.originalPath.split('/');
        const folderPath = parts.slice(0, -1).join('/');
        
        // Clean folder name for display
        const cleanFolderName = folderPath.split('/').pop() || folderPath;
        
        if (!collections.has(folderPath)) {
          collections.set(folderPath, {
            path: folderPath,
            name: cleanFolderName,
            files: [],
            zipSource: file.zipSource
          });
        }
        
        collections.get(folderPath).files.push(file);
      } else {
        // Individual files or root level files
        const collectionKey = file.isFromZip ? `${file.zipSource}-root` : 'individual-files';
        if (!collections.has(collectionKey)) {
          collections.set(collectionKey, {
            path: collectionKey,
            name: file.isFromZip ? `${file.zipSource} (Root)` : 'Individual Files',
            files: [],
            zipSource: file.zipSource
          });
        }
        
        collections.get(collectionKey).files.push(file);
      }
    });
    
    return Array.from(collections.values()).filter(collection => collection.files.length > 0);
  };

  // Available tactics for dropdown
  const availableTactics = [
    { category: 'Banner Ads', items: [
      { value: 'ignite', label: 'Ignite Banners' },
      { value: 'amped', label: 'AMPed Banners' }
    ]},
    { category: 'Social Media', items: [
      { value: 'facebook', label: 'Facebook' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'pinterest', label: 'Pinterest' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'snapchat', label: 'Snapchat' }
    ]},
    { category: 'Video Platforms', items: [
      { value: 'stv', label: 'STV' },
      { value: 'hulu', label: 'Hulu' },
      { value: 'netflix', label: 'Netflix' },
      { value: 'liveSports', label: 'Live Sports' }
    ]},
    { category: 'Spark & AMPed', items: [
      { value: 'spark-landscape', label: 'Spark Landscape' },
      { value: 'spark-square', label: 'Spark Square' },
      { value: 'spark-portrait', label: 'Spark Portrait' },
      { value: 'contentSponsorship', label: 'Content Sponsorship' },
      { value: 'listenLive', label: 'Listen Live' },
      { value: 'mobileBillboard', label: 'Mobile Billboard' }
    ]}
  ];

  // Get all tactics as flat array for filtering
  const allTactics = availableTactics.flatMap(cat => cat.items);
  
  // Filter tactics based on search term
  const filteredTactics = allTactics.filter(tactic => 
    tactic.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected tactic labels
  const getSelectedTacticLabels = () => {
    return selectedTactics.map(value => {
      const tactic = allTactics.find(t => t.value === value);
      return tactic?.label || value;
    });
  };

  // Toggle tactic selection
  const toggleTactic = (value) => {
    if (selectedTactics.includes(value)) {
      setSelectedTactics(selectedTactics.filter(t => t !== value));
    } else {
      setSelectedTactics([...selectedTactics, value]);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced AI analysis function
  const analyzeCreative = useCallback((file, dimensions) => {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const { width, height } = dimensions;
    
    // Banner ad size mapping
    const bannerAdSizes = {
      '300x250': 'Medium Rectangle',
      '728x90': 'Leaderboard', 
      '160x600': 'Wide Skyscraper',
      '336x280': 'Large Rectangle',
      '320x50': 'Mobile Leaderboard',
      '300x50': 'Mobile Banner',
      '468x60': 'Full Banner',
      '120x600': 'Skyscraper',
      '300x600': 'Half Page', // Note: Large Skyscraper is also 300x600, using Half Page as primary
    };
    
    // Determine aspect ratio and orientation
    const aspectRatio = width && height ? (width / height).toFixed(2) : 'unknown';
    const dimensionString = `${width}x${height}`;
    
    let orientation = 'unknown';
    if (width && height) {
      // Check if it's a standard banner ad size first
      if (bannerAdSizes[dimensionString]) {
        orientation = bannerAdSizes[dimensionString];
      } else {
        // Fall back to generic orientation
        if (width > height) orientation = 'landscape';
        else if (height > width) orientation = 'portrait';
        else orientation = 'square';
      }
    }

    // Suggest platforms based on dimensions and format
    const suggestedPlatforms = [];
    
    if (dimensionString === '1080x1080') suggestedPlatforms.push('Instagram Square', 'Facebook Square', 'LinkedIn');
    if (dimensionString === '1080x1920') suggestedPlatforms.push('Instagram Stories', 'TikTok', 'Snapchat');
    if (dimensionString === '1920x1080') suggestedPlatforms.push('YouTube', 'Hulu', 'STV');
    
    // Add banner ad suggestions with proper names
    if (bannerAdSizes[dimensionString]) {
      suggestedPlatforms.push(`${bannerAdSizes[dimensionString]} Banner Ad`);
    }

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
    
    // Banner ad size mapping for better identification
    const bannerAdSizes = {
      '300x250': 'Medium Rectangle',
      '728x90': 'Leaderboard', 
      '160x600': 'Wide Skyscraper',
      '336x280': 'Large Rectangle',
      '320x50': 'Mobile Leaderboard',
      '300x50': 'Mobile Banner',
      '468x60': 'Full Banner',
      '120x600': 'Skyscraper',
      '300x600': 'Half Page',
    };
    
    let matches = [];
    let warnings = [];
    let category = 'Unknown';
    let isBannerAd = false;

    // Check banner ads
    if (specs.bannerAds.ignite.sizes.includes(dimensionString)) {
      const bannerName = bannerAdSizes[dimensionString] ? `${bannerAdSizes[dimensionString]} ` : '';
      matches.push(`Ignite ${bannerName}Banner`);
      category = 'Banner Ads';
      isBannerAd = true;
      const sizeReq = specs.bannerAds.ignite.sizeRequirements[dimensionString];
      if (sizeReq && fileSizeKB > sizeReq.maxSizeKB) {
        warnings.push(`File size exceeds ${sizeReq.maxSizeKB}KB limit for ${dimensionString} Ignite banners`);
      }
    }
    
    if (specs.bannerAds.amped.sizes.includes(dimensionString)) {
      const bannerName = bannerAdSizes[dimensionString] ? `${bannerAdSizes[dimensionString]} ` : '';
      matches.push(`AMPed ${bannerName}Banner`);
      category = 'Banner Ads';
      isBannerAd = true;
      const sizeReq = specs.bannerAds.amped.sizeRequirements[dimensionString];
      if (sizeReq && fileSizeKB > sizeReq.maxSizeKB) {
        warnings.push(`File size exceeds ${sizeReq.maxSizeKB}KB limit for ${dimensionString} AMPed banners`);
      }
    }
    
    // If it matches a standard banner size but not our specific specs, still identify it as a banner
    if (!isBannerAd && bannerAdSizes[dimensionString]) {
      matches.push(`${bannerAdSizes[dimensionString]} Banner Ad`);
      category = 'Banner Ads';
      isBannerAd = true;
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

    return { matches, warnings, category, isBannerAd };
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
        // Skip directories
        if (fileData.dir) {
          continue;
        }

        // Skip macOS system files and folders
        if (filename.startsWith('__MACOSX/') || 
            filename.includes('/__MACOSX/') ||
            filename.startsWith('.DS_Store') ||
            filename.includes('/.DS_Store') ||
            filename.startsWith('._') ||
            filename.includes('/._') ||
            filename.startsWith('.') && filename.includes('/')) {
          console.log(`Skipping system file: ${filename}`);
          continue;
        }

        // Skip hidden files and system files at any level
        const pathParts = filename.split('/');
        const hasSystemFile = pathParts.some(part => 
          part.startsWith('.') || 
          part.startsWith('~') ||
          part === 'Thumbs.db' ||
          part === 'desktop.ini'
        );
        
        if (hasSystemFile) {
          console.log(`Skipping system/hidden file: ${filename}`);
          continue;
        }

        // Check if file has supported extension
        const extension = filename.split('.').pop()?.toLowerCase();
        if (!extension || !supportedExtensions.includes(extension)) {
          console.log(`Skipping unsupported file: ${filename}`);
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

          // Create File object from blob - preserve original filename
          const file = new File([blob], filename, { 
            type: mimeType,
            lastModified: fileData.date?.getTime() || Date.now()
          });

          extractedFiles.push({ file, originalPath: filename });
          console.log(`Successfully extracted: ${filename}`);
        } catch (fileError) {
          console.warn(`Error extracting file ${filename}:`, fileError);
          // Continue processing other files even if one fails
          continue;
        }
      }

      console.log(`Successfully extracted ${extractedFiles.length} supported files from ${zipFile.name}`);
      
      if (extractedFiles.length === 0) {
        console.warn(`No supported creative files found in ${zipFile.name}. Supported formats: ${supportedExtensions.join(', ')}`);
      }
      
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
            zipErrors.push(`No supported creative files found in ${file.name}. System files were filtered out.`);
            continue;
          }

          setProcessingStatus(`Analyzing ${extractedFiles.length} files from ${file.name}...`);
          
          for (const { file: extractedFile, originalPath } of extractedFiles) {
            const dimensions = await getMediaDimensions(extractedFile);
            const analysis = analyzeCreative(extractedFile, dimensions);
            const specCheck = checkSpecs(extractedFile, dimensions);

            processedFiles.push({
              id: Math.random().toString(36).substring(2, 11),
              originalName: extractedFile.name,
              originalPath: originalPath, // Store the original folder structure
              displayName: extractedFile.name,
              file: extractedFile,
              previewUrl: URL.createObjectURL(extractedFile),
              dimensions,
              size: extractedFile.size,
              type: extractedFile.type,
              analysis,
              specCheck,
              isFromZip: true,
              zipSource: file.name
            });
          }
          
          console.log(`Successfully processed ${extractedFiles.length} creative files from ${file.name} (system files filtered out)`);
          
          // Log summary of what was found vs filtered
          const totalFilesInZip = Object.keys(await new JSZip().loadAsync(file).then(zip => zip.files)).length;
          const filteredCount = totalFilesInZip - extractedFiles.length;
          if (filteredCount > 0) {
            console.log(`Filtered out ${filteredCount} system/unsupported files from ${file.name}`);
          }
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
            originalPath: file.name, // For individual files, path is just the filename
            displayName: file.name,
            file,
            previewUrl: URL.createObjectURL(file),
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
      console.warn('ZIP processing issues:', zipErrors);
      alert(`ZIP Processing Issues:\n${zipErrors.join('\n')}\n\nNote: System files (like __MACOSX, .DS_Store) are automatically filtered out.`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Remove file with confirmation
  const removeFile = (id) => {
    const fileToRemove = files.find(f => f.id === id);
    const fileName = fileToRemove?.displayName || 'this file';
    
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      setFiles(prev => {
        const fileToRemove = prev.find(f => f.id === id);
        if (fileToRemove?.previewUrl) {
          URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        return prev.filter(file => file.id !== id);
      });
    }
  };

  // Download specific collection
  const downloadCollection = async (collection, customName = null) => {
    if (collection.files.length === 0) return;
    
    const zip = new JSZip();
    const collectionName = customName ? sanitizeFilename(customName) : sanitizeFilename(collection.name);
    
    // Add each file to the ZIP
    for (const fileData of collection.files) {
      // Preserve file extension and sanitize filename
      const originalExt = fileData.originalName.split('.').pop();
      let sanitizedFileName = fileData.displayName;
      
      // Ensure filename has correct extension
      if (!sanitizedFileName.toLowerCase().endsWith(`.${originalExt.toLowerCase()}`)) {
        const nameWithoutExt = sanitizedFileName.split('.').slice(0, -1).join('.') || sanitizedFileName;
        sanitizedFileName = `${nameWithoutExt}.${originalExt}`;
      }
      
      // Sanitize the filename
      sanitizedFileName = sanitizeFilename(sanitizedFileName);
      
      // Add the file to the zip
      zip.file(sanitizedFileName, fileData.file);
    }
    
    // Generate the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create a download link
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${collectionName}-${new Date().toISOString().split('T')[0]}.zip`;
    link.click();
    
    // Clean up the URL
    URL.revokeObjectURL(url);
  };

  // Download all creatives as ZIP preserving original structure
  const downloadCreatives = async () => {
    if (files.length === 0) return;
    
    const zip = new JSZip();
    
    // Add each file to the ZIP preserving original folder structure
    for (const fileData of files) {
      // Use original path if file was from ZIP, or display name if renamed
      let filePath;
      
      if (fileData.isFromZip && fileData.originalPath) {
        // For files from ZIP, use original path but update the filename if it was renamed
        const originalDir = fileData.originalPath.substring(0, fileData.originalPath.lastIndexOf('/') + 1);
        const originalFilename = fileData.originalPath.substring(fileData.originalPath.lastIndexOf('/') + 1);
        
        // Preserve file extension
        const originalExt = fileData.originalName.split('.').pop();
        let displayName = fileData.displayName;
        if (!displayName.toLowerCase().endsWith(`.${originalExt.toLowerCase()}`)) {
          const nameWithoutExt = displayName.split('.').slice(0, -1).join('.') || displayName;
          displayName = `${nameWithoutExt}.${originalExt}`;
        }
        
        // If display name was changed from original, use the new name but keep the folder structure
        if (fileData.displayName !== originalFilename) {
          filePath = originalDir + sanitizeFilename(displayName);
        } else {
          filePath = fileData.originalPath;
        }
      } else {
        // For individual uploaded files, use display name with proper extension
        const originalExt = fileData.originalName.split('.').pop();
        let displayName = fileData.displayName;
        if (!displayName.toLowerCase().endsWith(`.${originalExt.toLowerCase()}`)) {
          const nameWithoutExt = displayName.split('.').slice(0, -1).join('.') || displayName;
          displayName = `${nameWithoutExt}.${originalExt}`;
        }
        filePath = sanitizeFilename(displayName);
      }
      
      // Add the file to the zip
      zip.file(filePath, fileData.file);
    }
    
    // Generate the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create a download link
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `creatives-${new Date().toISOString().split('T')[0]}.zip`;
    link.click();
    
    // Clean up the URL
    URL.revokeObjectURL(url);
  };


  const CollectionManager = () => {
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [collectionNames, setCollectionNames] = useState({});
    const [nameErrors, setNameErrors] = useState({});
    const fileCollections = getFileCollections();

    const handleNameChange = (collectionPath, newName) => {
      setCollectionNames(prev => ({ ...prev, [collectionPath]: newName }));
      
      // Validate the name
      if (!validateFilename(newName)) {
        setNameErrors(prev => ({ 
          ...prev, 
          [collectionPath]: 'Invalid characters: < > : " / \\ | ? * or starts/ends with space/period' 
        }));
      } else {
        setNameErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[collectionPath];
          return newErrors;
        });
      }
    };

    const handleDownloadSelected = async () => {
      for (const collectionPath of selectedCollections) {
        const collection = fileCollections.find(c => c.path === collectionPath);
        if (collection) {
          const customName = collectionNames[collectionPath];
          await downloadCollection(collection, customName);
        }
      }
      setShowCollectionManager(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Collection Manager</h2>
                <p className="text-gray-600 mt-1">Download organized collections of your creatives</p>
              </div>
              <button
                onClick={() => setShowCollectionManager(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {fileCollections.map(collection => (
                <div key={collection.path} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(collection.path)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCollections(prev => [...prev, collection.path]);
                        } else {
                          setSelectedCollections(prev => prev.filter(p => p !== collection.path));
                        }
                      }}
                      className="mt-1 w-4 h-4 text-[#cf0e0f] focus:ring-[#cf0e0f] rounded"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Archive className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {collection.files.length} files
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Collection Name (optional)
                        </label>
                        <input
                          type="text"
                          placeholder={`e.g., Facebook-August-2025-Social-Recruiting-Set`}
                          value={collectionNames[collection.path] || ''}
                          onChange={(e) => handleNameChange(collection.path, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#cf0e0f]/20 ${
                            nameErrors[collection.path] 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-gray-300 focus:border-[#cf0e0f]'
                          }`}
                        />
                        {nameErrors[collection.path] && (
                          <p className="text-xs text-red-600 mt-1">{nameErrors[collection.path]}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Use hyphens instead of spaces. Avoid: &lt; &gt; : " / \\ | ? *
                        </p>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="font-medium mb-1">Files in this collection:</div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {collection.files.slice(0, 6).map((file, idx) => (
                            <div key={idx} className="truncate">
                              {file.displayName}
                            </div>
                          ))}
                          {collection.files.length > 6 && (
                            <div className="text-gray-500">+{collection.files.length - 6} more...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {fileCollections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No collections found. Upload some files to get started.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedCollections.length > 0 ? (
                  `${selectedCollections.length} collection${selectedCollections.length !== 1 ? 's' : ''} selected`
                ) : (
                  'Select collections to download'
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCollectionManager(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownloadSelected}
                  disabled={selectedCollections.length === 0 || Object.keys(nameErrors).length > 0}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                    selectedCollections.length === 0 || Object.keys(nameErrors).length > 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download Selected</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FileCard = ({ file }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(file.displayName);
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Check if file matches selected tactics
    const checkTacticMatch = () => {
      if (selectedTactics.length === 0) {
        // When no tactics selected, show all specs that match
        return { 
          matches: file.specCheck.matches.length > 0, 
          matchedTactics: file.specCheck.matches, 
          unmatchedTactics: [] 
        };
      }
      
      // Map tactic selection to what the spec checker actually returns
      const tacticMatchMap = {
        'ignite': ['Ignite', 'Ignite Banner'], // Match any Ignite banner type
        'amped': ['AMPed', 'AMPed Banner'], // Match any AMPed banner type
        'facebook': ['Facebook Social'],
        'instagram': ['Instagram Social'],
        'pinterest': ['Pinterest Social'],
        'linkedin': ['Linkedin Social'],
        'tiktok': ['Tiktok Social'],
        'snapchat': ['Snapchat Social'],
        'stv': ['STV Video'],
        'hulu': ['HULU Video'],
        'netflix': ['NETFLIX Video'],
        'liveSports': ['LIVESPORTS Video'],
        'spark-landscape': ['Spark Landscape'],
        'spark-square': ['Spark Square'],
        'spark-portrait': ['Spark Portrait'],
        'spark-video': ['Spark Video'],
        'contentSponsorship': ['AMPed contentSponsorship headerDesktop', 'AMPed contentSponsorship headerMobile', 'AMPed contentSponsorship footerLogo'],
        'listenLive': ['AMPed listenLive skin', 'AMPed listenLive banners', 'AMPed listenLive preRoll'],
        'mobileBillboard': ['AMPed mobileBillboard'],
        'takeover': ['AMPed takeover skin', 'AMPed takeover billboard']
      };
      
      const tacticDisplayNames = {
        'ignite': 'Ignite Banners',
        'amped': 'AMPed Banners',
        'facebook': 'Facebook',
        'instagram': 'Instagram',
        'pinterest': 'Pinterest',
        'linkedin': 'LinkedIn',
        'tiktok': 'TikTok',
        'snapchat': 'Snapchat',
        'stv': 'STV',
        'hulu': 'Hulu',
        'netflix': 'Netflix',
        'liveSports': 'Live Sports',
        'spark-landscape': 'Spark Landscape',
        'spark-square': 'Spark Square',
        'spark-portrait': 'Spark Portrait',
        'spark-video': 'Spark Video',
        'contentSponsorship': 'AMPed Content Sponsorship',
        'listenLive': 'AMPed Listen Live',
        'mobileBillboard': 'AMPed Mobile Billboard',
        'takeover': 'AMPed Takeover'
      };
      
      const matchedTactics = [];
      const unmatchedTactics = [];
      
      selectedTactics.forEach(tactic => {
        const expectedMatches = tacticMatchMap[tactic] || [];
        const matches = file.specCheck.matches.some(match => 
          expectedMatches.some(expectedMatch => 
            match.toLowerCase().includes(expectedMatch.toLowerCase()) ||
            expectedMatch.toLowerCase().includes(match.toLowerCase())
          )
        );
        
        if (matches) {
          matchedTactics.push(tacticDisplayNames[tactic]);
        } else {
          unmatchedTactics.push(tacticDisplayNames[tactic]);
        }
      });
      
      return { 
        matches: matchedTactics.length > 0, 
        matchedTactics, 
        unmatchedTactics 
      };
    };
    
    // Check if specific spec requirements match selected tactics
    const checkSpecRequirementMatch = (type) => {
      const dimensionString = `${file.dimensions.width}x${file.dimensions.height}`;
      const fileSizeKB = file.size / 1024;
      const fileExtension = file.analysis.format.toLowerCase();
      
      if (selectedTactics.length === 0) {
        // When no tactics selected, check against all available specs
        let matches = false;
        
        if (type === 'dimensions') {
          matches = file.specCheck.matches.length > 0;
        } else if (type === 'fileSize') {
          // Check if file size meets banner requirements (if it's a banner)
          if (file.specCheck.isBannerAd) {
            const isIgniteBanner = file.specCheck.matches.some(m => m.toLowerCase().includes('ignite'));
            const isAmpedBanner = file.specCheck.matches.some(m => m.toLowerCase().includes('amped'));
            
            if (isIgniteBanner) {
              const sizeReq = specs.bannerAds.ignite.sizeRequirements[dimensionString];
              matches = sizeReq && fileSizeKB <= sizeReq.maxSizeKB;
            } else if (isAmpedBanner) {
              const sizeReq = specs.bannerAds.amped.sizeRequirements[dimensionString];
              matches = sizeReq && fileSizeKB <= sizeReq.maxSizeKB;
            }
          } else {
            matches = true; // Non-banner files don't have specific size requirements
          }
        } else if (type === 'format') {
          matches = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm'].includes(fileExtension);
        }
        
        return { matches, hasSelectedTactics: false };
      }
      
      // Check if this file matches any of the selected tactic specs
      const tacticResults = selectedTactics.map(tactic => {
        // Check if file matches this tactic at all
        const tacticMatches = file.specCheck.matches.some(match => 
          (match.toLowerCase().includes('ignite') && tactic === 'ignite') ||
          (match.toLowerCase().includes('amped') && tactic === 'amped') ||
          (match.toLowerCase().includes('facebook') && tactic === 'facebook') ||
          (match.toLowerCase().includes('instagram') && tactic === 'instagram') ||
          (match.toLowerCase().includes('pinterest') && tactic === 'pinterest') ||
          (match.toLowerCase().includes('linkedin') && tactic === 'linkedin') ||
          (match.toLowerCase().includes('tiktok') && tactic === 'tiktok') ||
          (match.toLowerCase().includes('snapchat') && tactic === 'snapchat') ||
          (match.toLowerCase().includes('stv') && tactic === 'stv') ||
          (match.toLowerCase().includes('hulu') && tactic === 'hulu') ||
          (match.toLowerCase().includes('netflix') && tactic === 'netflix') ||
          (match.toLowerCase().includes('livesports') && tactic === 'liveSports')
        );
        
        if (!tacticMatches) return false;
        
        if (tactic === 'ignite' || tactic === 'amped') {
          if (type === 'dimensions') {
            return specs.bannerAds[tactic]?.sizes.includes(dimensionString);
          } else if (type === 'fileSize') {
            const sizeReq = specs.bannerAds[tactic]?.sizeRequirements[dimensionString];
            return sizeReq && fileSizeKB <= sizeReq.maxSizeKB;
          } else if (type === 'format') {
            return ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
          }
        } else {
          // For non-banner tactics, basic format validation
          if (type === 'format') {
            return ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm'].includes(fileExtension);
          }
          return tacticMatches; // For dimensions and size, if it matches the tactic, it's valid
        }
        
        return false;
      });
      
      const matches = tacticResults.some(result => result === true);
      return { matches, hasSelectedTactics: true };
    };
    
    const tacticCheck = checkTacticMatch();

    const handleSaveName = () => {
      if (!validateFilename(editName)) {
        alert('Invalid filename. Please avoid: < > : " / \\ | ? * and don\'t start/end with spaces or periods.');
        return;
      }
      
      // Preserve original file extension
      const originalExt = file.originalName.split('.').pop();
      let newName = editName;
      
      // Ensure the extension is preserved
      if (!newName.toLowerCase().endsWith(`.${originalExt.toLowerCase()}`)) {
        const nameWithoutExt = newName.split('.').slice(0, -1).join('.') || newName;
        newName = `${nameWithoutExt}.${originalExt}`;
      }
      
      updateFileName(file.id, sanitizeFilename(newName));
      setIsEditing(false);
    };

    return (
      <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#cf0e0f] focus:border-transparent"
                  />
                  <button onClick={handleSaveName} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {file.displayName.split('/').pop()}
                    </h4>
                    {file.isFromZip && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center space-x-1">
                        <Archive className="w-3 h-3" />
                        <span>ZIP</span>
                      </span>
                    )}
                  </div>
                  {(file.isFromZip || file.originalPath?.includes('/')) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {file.isFromZip ? (
                        <>
                          Extracted from: {file.originalPath || file.zipSource}
                          {files.filter(f => f.zipSource === file.zipSource).length > 1 && 
                            ` • ${files.filter(f => f.zipSource === file.zipSource).length} files total`
                          }
                        </>
                      ) : (
                        file.originalPath?.includes('/') && file.originalPath.substring(0, file.originalPath.lastIndexOf('/'))
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => removeFile(file.id)} 
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              {isCollapsed ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div>
            {/* Preview */}
            <div className="relative mb-6 w-full h-48 rounded-xl overflow-hidden bg-gray-100 cursor-pointer group" 
                 onClick={() => file.type.startsWith('image/') && setLightboxImage(file.previewUrl)}>
              {file.type.startsWith('image/') ? (
                <>
                  <img
                    src={file.previewUrl}
                    alt={file.displayName}
                    loading="lazy"
                    className="w-full h-full object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 px-3 py-1 rounded-lg text-sm font-medium text-gray-700">
                      Click to expand
                    </div>
                  </div>
                </>
              ) : file.type.startsWith('video/') ? (
                <video
                  src={file.previewUrl}
                  className="w-full h-full object-contain"
                  preload="metadata"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  No preview available
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                {file.dimensions.width} × {file.dimensions.height}
              </div>
            </div>

            {/* File Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`rounded-xl p-4 ${
                checkSpecRequirementMatch('dimensions').matches 
                  ? 'bg-green-50 border-2 border-green-300' 
                  : (checkSpecRequirementMatch('dimensions').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0)
                    ? 'bg-red-50 border-2 border-red-300'
                    : 'bg-gray-50'
              }`}>
                <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                  checkSpecRequirementMatch('dimensions').matches 
                    ? 'text-green-700' 
                    : (checkSpecRequirementMatch('dimensions').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0)
                      ? 'text-red-700'
                      : 'text-gray-500'
                }`}>
                  Dimensions
                  {checkSpecRequirementMatch('dimensions').matches && (
                    <span className="ml-2 px-1 py-0.5 bg-green-600 text-white text-xs rounded">✓ MATCH</span>
                  )}
                  {(!checkSpecRequirementMatch('dimensions').matches && checkSpecRequirementMatch('dimensions').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0) && (
                    <span className="ml-2 px-1 py-0.5 bg-red-600 text-white text-xs rounded">✗ NO MATCH</span>
                  )}
                </div>
                <div className={`text-lg font-bold font-mono ${
                  checkSpecRequirementMatch('dimensions').matches 
                    ? 'text-green-900' 
                    : (checkSpecRequirementMatch('dimensions').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0)
                      ? 'text-red-900'
                      : 'text-gray-900'
                }`}>
                  {file.dimensions.width} × {file.dimensions.height}
                </div>
              </div>
              <div className={`rounded-xl p-4 ${
                checkSpecRequirementMatch('fileSize').matches 
                  ? 'bg-green-50 border-2 border-green-300' 
                  : (checkSpecRequirementMatch('fileSize').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0)
                    ? 'bg-red-50 border-2 border-red-300'
                    : 'bg-gray-50'
              }`}>
                <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                  checkSpecRequirementMatch('fileSize').matches 
                    ? 'text-green-700' 
                    : (checkSpecRequirementMatch('fileSize').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0)
                      ? 'text-red-700'
                      : 'text-gray-500'
                }`}>
                  File Size
                  {checkSpecRequirementMatch('fileSize').matches && (
                    <span className="ml-2 px-1 py-0.5 bg-green-600 text-white text-xs rounded">✓ MATCH</span>
                  )}
                  {(!checkSpecRequirementMatch('fileSize').matches && checkSpecRequirementMatch('fileSize').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0) && (
                    <span className="ml-2 px-1 py-0.5 bg-red-600 text-white text-xs rounded">✗ NO MATCH</span>
                  )}
                </div>
                <div className={`text-lg font-bold ${
                  checkSpecRequirementMatch('fileSize').matches 
                    ? 'text-green-900' 
                    : (checkSpecRequirementMatch('fileSize').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0)
                      ? 'text-red-900'
                      : 'text-gray-900'
                }`}>
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <div className={`rounded-xl p-4 ${
                checkSpecRequirementMatch('format').matches 
                  ? 'bg-green-50 border-2 border-green-300' 
                  : (checkSpecRequirementMatch('format').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0)
                    ? 'bg-red-50 border-2 border-red-300'
                    : 'bg-gray-50'
              }`}>
                <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                  checkSpecRequirementMatch('format').matches 
                    ? 'text-green-700' 
                    : (checkSpecRequirementMatch('format').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0)
                      ? 'text-red-700'
                      : 'text-gray-500'
                }`}>
                  Format
                  {checkSpecRequirementMatch('format').matches && (
                    <span className="ml-2 px-1 py-0.5 bg-green-600 text-white text-xs rounded">✓ MATCH</span>
                  )}
                  {(!checkSpecRequirementMatch('format').matches && checkSpecRequirementMatch('format').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0) && (
                    <span className="ml-2 px-1 py-0.5 bg-red-600 text-white text-xs rounded">✗ NO MATCH</span>
                  )}
                </div>
                <div className={`text-lg font-bold ${
                  checkSpecRequirementMatch('format').matches 
                    ? 'text-green-900' 
                    : (checkSpecRequirementMatch('format').hasSelectedTactics && tacticCheck.unmatchedTactics.length > 0)
                      ? 'text-red-900'
                      : 'text-gray-900'
                }`}>
                  {file.analysis.format}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {file.specCheck.isBannerAd ? 'Banner Type' : 'Orientation'}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {file.specCheck.isBannerAd ? file.analysis.orientation : (
                    <span className="capitalize">{file.analysis.orientation}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tactic Match Status */}
            {selectedTactics.length > 0 && (
              <>
                {tacticCheck.matchedTactics.length > 0 && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <span className="text-sm text-green-800">
                          Matches: <strong>{tacticCheck.matchedTactics.join(', ')}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {tacticCheck.unmatchedTactics.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-yellow-800">
                          Does not match: <strong>{tacticCheck.unmatchedTactics.join(', ')}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

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
                <div>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-600">Matches Found:</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {file.specCheck.matches.map((match, idx) => {
                      const isSelectedTactic = selectedTactics.length > 0 && selectedTactics.some(tactic => {
                        const tacticMatchMap = {
                          'ignite': ['Ignite', 'Ignite Banner'],
                          'amped': ['AMPed', 'AMPed Banner'],
                          'facebook': ['Facebook Social'],
                          'instagram': ['Instagram Social'],
                          'pinterest': ['Pinterest Social'],
                          'linkedin': ['Linkedin Social'],
                          'tiktok': ['Tiktok Social'],
                          'snapchat': ['Snapchat Social'],
                          'stv': ['STV Video'],
                          'hulu': ['HULU Video'],
                          'netflix': ['NETFLIX Video'],
                          'liveSports': ['LIVESPORTS Video'],
                          'spark-landscape': ['Spark Landscape'],
                          'spark-square': ['Spark Square'],
                          'spark-portrait': ['Spark Portrait'],
                          'spark-video': ['Spark Video'],
                          'contentSponsorship': ['AMPed contentSponsorship headerDesktop', 'AMPed contentSponsorship headerMobile', 'AMPed contentSponsorship footerLogo'],
                          'listenLive': ['AMPed listenLive skin', 'AMPed listenLive banners', 'AMPed listenLive preRoll'],
                          'mobileBillboard': ['AMPed mobileBillboard'],
                          'takeover': ['AMPed takeover skin', 'AMPed takeover billboard']
                        };
                        const expectedMatches = tacticMatchMap[tactic] || [];
                        return expectedMatches.some(expectedMatch => 
                          match.toLowerCase().includes(expectedMatch.toLowerCase()) ||
                          expectedMatch.toLowerCase().includes(match.toLowerCase())
                        );
                      });
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-center p-3 rounded-xl border ${
                            isSelectedTactic 
                              ? 'bg-green-50 border-green-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                            isSelectedTactic 
                              ? 'bg-green-500' 
                              : 'bg-gray-400'
                          }`}>
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <span className={`font-medium ${
                            isSelectedTactic 
                              ? 'text-green-800' 
                              : 'text-gray-700'
                          }`}>
                            {match}
                            {isSelectedTactic && (
                              <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">TARGET MATCH</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
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
          </div>
        )}
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
              className="px-6 py-3 bg-gradient-to-r from-[#cf0e0f] to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
                      className="w-full p-3 border border-gray-300 rounded-xl text-sm font-mono bg-gray-50 focus:ring-2 focus:ring-[#cf0e0f] focus:border-transparent"
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
                  
                  {/* Missing Standard Banner Sizes Alert */}
                  {(() => {
                    const standardBannerSizes = ['300x250', '728x90', '160x600', '336x280', '320x50', '300x50', '468x60', '120x600', '300x600'];
                    const missingSizes = standardBannerSizes.filter(size => !editingSpecs.bannerAds.ignite.sizes.includes(size));
                    return missingSizes.length > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-yellow-800">Missing Standard Banner Sizes:</div>
                            <div className="text-xs text-yellow-700 mt-1">{missingSizes.join(', ')}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
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
                      className="w-full p-3 border border-gray-300 rounded-xl text-sm font-mono bg-gray-50 focus:ring-2 focus:ring-[#cf0e0f] focus:border-transparent"
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
                  
                  {/* Missing Standard Banner Sizes Alert */}
                  {(() => {
                    const standardBannerSizes = ['300x250', '728x90', '160x600', '336x280', '320x50', '300x50', '468x60', '120x600', '300x600'];
                    const missingSizes = standardBannerSizes.filter(size => !editingSpecs.bannerAds.amped.sizes.includes(size));
                    return missingSizes.length > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-yellow-800">Missing Standard Banner Sizes:</div>
                            <div className="text-xs text-yellow-700 mt-1">{missingSizes.join(', ')}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
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
                        className="w-full p-3 border border-gray-300 rounded-xl text-sm font-mono bg-gray-50 focus:ring-2 focus:ring-[#cf0e0f] focus:border-transparent"
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
              <div className="w-10 h-10 bg-gradient-to-r from-[#cf0e0f] to-red-700 rounded-xl flex items-center justify-center">
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
              {files.length > 0 && (
                <button 
                  onClick={() => setFiles([])}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
              {files.length > 0 && getFileCollections().length > 1 && (
                <button 
                  onClick={() => setShowCollectionManager(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Archive className="w-4 h-4" />
                  <span>Manage Collections</span>
                </button>
              )}
              {files.length > 0 && (
                <button 
                  onClick={downloadCreatives}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {[
            { id: 'upload', label: 'Upload & Validate', icon: Upload, description: 'Upload and analyze creatives' },
            { id: 'settings', label: 'Spec Management', icon: Settings, description: 'Configure validation rules' }
          ].map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group relative px-4 py-3 rounded-2xl flex items-center space-x-3 transition-all duration-200 ${
                activeTab === id 
                  ? 'bg-gradient-to-r from-[#cf0e0f] to-red-700 text-white shadow-lg shadow-red-500/25 scale-105' 
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
            {/* Tactic Selection Dropdown */}
            <div className="glass rounded-3xl p-6 shadow-lg relative z-50" style={{zIndex: 1000}}>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select Target Tactics</h3>
                <p className="text-gray-600 mb-4">Choose which tactics to validate your creatives against (select multiple)</p>
                
                <div className="relative z-50" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#cf0e0f] focus:border-[#cf0e0f] focus:ring-2 focus:ring-[#cf0e0f]/20 transition-all"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {selectedTactics.length === 0 ? (
                        <span className="text-gray-500">Select tactics...</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                          {getSelectedTacticLabels().map((label, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 bg-[#cf0e0f]/10 text-[#cf0e0f] text-xs font-medium rounded-md"
                            >
                              {label}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const valueToRemove = selectedTactics[idx];
                                  setSelectedTactics(selectedTactics.filter(t => t !== valueToRemove));
                                }}
                                className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-hidden">
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search tactics... (Ctrl+A: select all, Del: clear)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#cf0e0f]/20 focus:border-[#cf0e0f]"
                          />
                        </div>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto">
                        {searchTerm ? (
                          // Show filtered results
                          <div className="p-2">
                            {filteredTactics.length > 0 ? (
                              filteredTactics.map(tactic => (
                                <label key={tactic.value} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedTactics.includes(tactic.value)}
                                    onChange={() => toggleTactic(tactic.value)}
                                    className="w-4 h-4 text-[#cf0e0f] focus:ring-[#cf0e0f] rounded"
                                  />
                                  <span className="text-sm font-medium text-gray-700">{tactic.label}</span>
                                </label>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500 text-sm">No tactics found</div>
                            )}
                          </div>
                        ) : (
                          // Show categorized results
                          availableTactics.map(category => (
                            <div key={category.category} className="p-2">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">
                                {category.category}
                              </div>
                              {category.items.map(tactic => (
                                <label key={tactic.value} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedTactics.includes(tactic.value)}
                                    onChange={() => toggleTactic(tactic.value)}
                                    className="w-4 h-4 text-[#cf0e0f] focus:ring-[#cf0e0f] rounded"
                                  />
                                  <span className="text-sm font-medium text-gray-700">{tactic.label}</span>
                                </label>
                              ))}
                            </div>
                          ))
                        )}
                      </div>

                      {selectedTactics.length > 0 && (
                        <div className="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                          <span className="text-sm text-gray-600 font-medium">
                            {selectedTactics.length} selected
                          </span>
                          <button
                            onClick={() => {
                              setSelectedTactics([]);
                              setIsDropdownOpen(false);
                              setSearchTerm('');
                            }}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Clear all
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Upload Area */}
            <div className="relative">
              <div
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-[#cf0e0f] bg-gradient-to-r from-red-50 to-pink-50 scale-102 shadow-xl' 
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
                      ? 'bg-[#cf0e0f] shadow-lg' 
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
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                    <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-xl">
                      <Image className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Images</span>
                      <span className="text-xs text-gray-500">JPG, PNG, GIF,<br />WebP</span>
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
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#cf0e0f] border-t-transparent"></div>
                        <span className="text-red-700 font-medium">{processingStatus}</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                      isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#cf0e0f] to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
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

            {/* Summary Stats */}
            {files.length > 0 && (
              <div className="glass rounded-2xl p-4 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis Overview</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-bold text-blue-600">{files.length}</div>
                    <div className="text-xs font-medium text-blue-800">Total Files</div>
                  </div>
                  
                  {/* Smart Compliance Counter */}
                  <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {(() => {
                        if (selectedTactics.length === 0) {
                          return files.filter(f => f.specCheck.matches.length > 0).length;
                        } else {
                          const tacticMatchMap = {
                            'ignite': ['Ignite', 'Ignite Banner'],
                            'amped': ['AMPed', 'AMPed Banner'],
                            'facebook': ['Facebook Social'],
                            'instagram': ['Instagram Social'],
                            'pinterest': ['Pinterest Social'],
                            'linkedin': ['Linkedin Social'],
                            'tiktok': ['Tiktok Social'],
                            'snapchat': ['Snapchat Social'],
                            'stv': ['STV Video'],
                            'hulu': ['HULU Video'],
                            'netflix': ['NETFLIX Video'],
                            'liveSports': ['LIVESPORTS Video'],
                            'spark-landscape': ['Spark Landscape'],
                            'spark-square': ['Spark Square'],
                            'spark-portrait': ['Spark Portrait'],
                            'spark-video': ['Spark Video'],
                            'contentSponsorship': ['AMPed contentSponsorship headerDesktop', 'AMPed contentSponsorship headerMobile', 'AMPed contentSponsorship footerLogo'],
                            'listenLive': ['AMPed listenLive skin', 'AMPed listenLive banners', 'AMPed listenLive preRoll'],
                            'mobileBillboard': ['AMPed mobileBillboard'],
                            'takeover': ['AMPed takeover skin', 'AMPed takeover billboard']
                          };
                          
                          return files.filter(file => {
                            return selectedTactics.some(tactic => {
                              const expectedMatches = tacticMatchMap[tactic] || [];
                              return file.specCheck.matches.some(match => 
                                expectedMatches.some(expectedMatch => 
                                  match.toLowerCase().includes(expectedMatch.toLowerCase()) ||
                                  expectedMatch.toLowerCase().includes(match.toLowerCase())
                                )
                              );
                            });
                          }).length;
                        }
                      })()
                      }
                    </div>
                    <div className="text-xs font-medium text-green-800">
                      {selectedTactics.length === 0 ? 'Spec Compliant' : 'Tactic Matches'}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-bold text-purple-600">
                      {files.filter(f => f.type.startsWith('image/')).length}
                    </div>
                    <div className="text-xs font-medium text-purple-800">Images</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-bold text-orange-600">
                      {files.filter(f => f.type.startsWith('video/')).length}
                    </div>
                    <div className="text-xs font-medium text-orange-800">Videos</div>
                  </div>
                </div>
              </div>
            )}

            {/* File Sorting Controls */}
            {files.length > 0 && (
              <div className="glass rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">File Organization</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                      value={fileSortOrder}
                      onChange={(e) => setFileSortOrder(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#cf0e0f] focus:border-[#cf0e0f]"
                    >
                      <option value="default">Upload Order</option>
                      <option value="compliant-first">Compliant First</option>
                      <option value="non-compliant-first">Non-Compliant First</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Files Grid */}
            {files.length > 0 && (
              <div className="space-y-6">
                {(() => {
                  let sortedFiles = [...files];
                  
                  if (fileSortOrder === 'compliant-first') {
                    sortedFiles.sort((a, b) => {
                      const aTacticCheck = selectedTactics.length === 0 ? 
                        { matches: a.specCheck.matches.length > 0 } :
                        (() => {
                          const tacticMatchMap = {
                            'ignite': ['Ignite', 'Ignite Banner'],
                            'amped': ['AMPed', 'AMPed Banner'],
                            'facebook': ['Facebook Social'],
                            'instagram': ['Instagram Social'],
                            'pinterest': ['Pinterest Social'],
                            'linkedin': ['Linkedin Social'],
                            'tiktok': ['Tiktok Social'],
                            'snapchat': ['Snapchat Social'],
                            'stv': ['STV Video'],
                            'hulu': ['HULU Video'],
                            'netflix': ['NETFLIX Video'],
                            'liveSports': ['LIVESPORTS Video'],
                            'spark-landscape': ['Spark Landscape'],
                            'spark-square': ['Spark Square'],
                            'spark-portrait': ['Spark Portrait'],
                            'spark-video': ['Spark Video'],
                            'contentSponsorship': ['AMPed contentSponsorship headerDesktop', 'AMPed contentSponsorship headerMobile', 'AMPed contentSponsorship footerLogo'],
                            'listenLive': ['AMPed listenLive skin', 'AMPed listenLive banners', 'AMPed listenLive preRoll'],
                            'mobileBillboard': ['AMPed mobileBillboard'],
                            'takeover': ['AMPed takeover skin', 'AMPed takeover billboard']
                          };
                          const matchedTactics = selectedTactics.filter(tactic => {
                            const expectedMatches = tacticMatchMap[tactic] || [];
                            return a.specCheck.matches.some(match => 
                              expectedMatches.some(expectedMatch => 
                                match.toLowerCase().includes(expectedMatch.toLowerCase()) ||
                                expectedMatch.toLowerCase().includes(match.toLowerCase())
                              )
                            );
                          });
                          return { matches: matchedTactics.length > 0 };
                        })();
                      
                      const bTacticCheck = selectedTactics.length === 0 ? 
                        { matches: b.specCheck.matches.length > 0 } :
                        (() => {
                          const tacticMatchMap = {
                            'ignite': ['Ignite', 'Ignite Banner'],
                            'amped': ['AMPed', 'AMPed Banner'],
                            'facebook': ['Facebook Social'],
                            'instagram': ['Instagram Social'],
                            'pinterest': ['Pinterest Social'],
                            'linkedin': ['Linkedin Social'],
                            'tiktok': ['Tiktok Social'],
                            'snapchat': ['Snapchat Social'],
                            'stv': ['STV Video'],
                            'hulu': ['HULU Video'],
                            'netflix': ['NETFLIX Video'],
                            'liveSports': ['LIVESPORTS Video'],
                            'spark-landscape': ['Spark Landscape'],
                            'spark-square': ['Spark Square'],
                            'spark-portrait': ['Spark Portrait'],
                            'spark-video': ['Spark Video'],
                            'contentSponsorship': ['AMPed contentSponsorship headerDesktop', 'AMPed contentSponsorship headerMobile', 'AMPed contentSponsorship footerLogo'],
                            'listenLive': ['AMPed listenLive skin', 'AMPed listenLive banners', 'AMPed listenLive preRoll'],
                            'mobileBillboard': ['AMPed mobileBillboard'],
                            'takeover': ['AMPed takeover skin', 'AMPed takeover billboard']
                          };
                          const matchedTactics = selectedTactics.filter(tactic => {
                            const expectedMatches = tacticMatchMap[tactic] || [];
                            return b.specCheck.matches.some(match => 
                              expectedMatches.some(expectedMatch => 
                                match.toLowerCase().includes(expectedMatch.toLowerCase()) ||
                                expectedMatch.toLowerCase().includes(match.toLowerCase())
                              )
                            );
                          });
                          return { matches: matchedTactics.length > 0 };
                        })();
                      
                      if (aTacticCheck.matches && !bTacticCheck.matches) return -1;
                      if (!aTacticCheck.matches && bTacticCheck.matches) return 1;
                      return 0;
                    });
                  } else if (fileSortOrder === 'non-compliant-first') {
                    sortedFiles.sort((a, b) => {
                      const aTacticCheck = selectedTactics.length === 0 ? 
                        { matches: a.specCheck.matches.length > 0 } :
                        (() => {
                          const tacticMatchMap = {
                            'ignite': ['Ignite', 'Ignite Banner'],
                            'amped': ['AMPed', 'AMPed Banner'],
                            'facebook': ['Facebook Social'],
                            'instagram': ['Instagram Social'],
                            'pinterest': ['Pinterest Social'],
                            'linkedin': ['Linkedin Social'],
                            'tiktok': ['Tiktok Social'],
                            'snapchat': ['Snapchat Social'],
                            'stv': ['STV Video'],
                            'hulu': ['HULU Video'],
                            'netflix': ['NETFLIX Video'],
                            'liveSports': ['LIVESPORTS Video'],
                            'spark-landscape': ['Spark Landscape'],
                            'spark-square': ['Spark Square'],
                            'spark-portrait': ['Spark Portrait'],
                            'spark-video': ['Spark Video'],
                            'contentSponsorship': ['AMPed contentSponsorship headerDesktop', 'AMPed contentSponsorship headerMobile', 'AMPed contentSponsorship footerLogo'],
                            'listenLive': ['AMPed listenLive skin', 'AMPed listenLive banners', 'AMPed listenLive preRoll'],
                            'mobileBillboard': ['AMPed mobileBillboard'],
                            'takeover': ['AMPed takeover skin', 'AMPed takeover billboard']
                          };
                          const matchedTactics = selectedTactics.filter(tactic => {
                            const expectedMatches = tacticMatchMap[tactic] || [];
                            return a.specCheck.matches.some(match => 
                              expectedMatches.some(expectedMatch => 
                                match.toLowerCase().includes(expectedMatch.toLowerCase()) ||
                                expectedMatch.toLowerCase().includes(match.toLowerCase())
                              )
                            );
                          });
                          return { matches: matchedTactics.length > 0 };
                        })();
                      
                      const bTacticCheck = selectedTactics.length === 0 ? 
                        { matches: b.specCheck.matches.length > 0 } :
                        (() => {
                          const tacticMatchMap = {
                            'ignite': ['Ignite', 'Ignite Banner'],
                            'amped': ['AMPed', 'AMPed Banner'],
                            'facebook': ['Facebook Social'],
                            'instagram': ['Instagram Social'],
                            'pinterest': ['Pinterest Social'],
                            'linkedin': ['Linkedin Social'],
                            'tiktok': ['Tiktok Social'],
                            'snapchat': ['Snapchat Social'],
                            'stv': ['STV Video'],
                            'hulu': ['HULU Video'],
                            'netflix': ['NETFLIX Video'],
                            'liveSports': ['LIVESPORTS Video'],
                            'spark-landscape': ['Spark Landscape'],
                            'spark-square': ['Spark Square'],
                            'spark-portrait': ['Spark Portrait'],
                            'spark-video': ['Spark Video'],
                            'contentSponsorship': ['AMPed contentSponsorship headerDesktop', 'AMPed contentSponsorship headerMobile', 'AMPed contentSponsorship footerLogo'],
                            'listenLive': ['AMPed listenLive skin', 'AMPed listenLive banners', 'AMPed listenLive preRoll'],
                            'mobileBillboard': ['AMPed mobileBillboard'],
                            'takeover': ['AMPed takeover skin', 'AMPed takeover billboard']
                          };
                          const matchedTactics = selectedTactics.filter(tactic => {
                            const expectedMatches = tacticMatchMap[tactic] || [];
                            return b.specCheck.matches.some(match => 
                              expectedMatches.some(expectedMatch => 
                                match.toLowerCase().includes(expectedMatch.toLowerCase()) ||
                                expectedMatch.toLowerCase().includes(match.toLowerCase())
                              )
                            );
                          });
                          return { matches: matchedTactics.length > 0 };
                        })();
                      
                      if (!aTacticCheck.matches && bTacticCheck.matches) return -1;
                      if (aTacticCheck.matches && !bTacticCheck.matches) return 1;
                      return 0;
                    });
                  }
                  
                  return sortedFiles.map(file => (
                    <FileCard key={file.id} file={file} />
                  ));
                })()}
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

      {/* Collection Manager Modal */}
      {showCollectionManager && <CollectionManager />}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={lightboxImage}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreativeChecker;