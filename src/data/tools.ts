export interface ToolPage {
  slug: string;
  title: string;
  description: string;
  type: 'compressor' | 'resizer' | 'signature';
  category: 'photo' | 'signature' | 'pdf';
  targetKB?: number;
  defaultMode?: 'pixels' | 'preset';
  defaultPreset?: string;
  defaultTargetKB?: number;
  guideText: string;
  faqs: { question: string; answer: string }[];
  popular?: boolean;
}

export const toolsData: ToolPage[] = [
  // --- PHOTO TOOLS: COMPRESSOR ---
  {
    slug: 'compress-image-to-20kb',
    title: 'Compress Image to 20 KB',
    description: 'Easily compress your image to 20 KB online for free. Perfect for application forms and submissions.',
    type: 'compressor',
    category: 'photo',
    targetKB: 20,
    popular: true,
    guideText: 'Need to compress a photo to exactly 20 KB for a job application or exam registration? You are in the right place. Our online image compressor reduces file sizes without losing noticeable quality. Simply upload your photo or signature, and our tool will automatically adjust and optimize the file to meet the 20 KB limit. Note that each form may have its own specifications, so please check their official instructions regarding image dimensions and formats.',
    faqs: [
      { question: 'Is my data secure?', answer: 'Yes. All image processing happens directly in your browser. Your files are never uploaded to any server.' },
      { question: 'Will this affect image quality?', answer: 'Our compressor automatically finds the best balance between quality and file size to ensure your image remains as clear as possible while staying under 20 KB.' },
      { question: 'What formats are supported?', answer: 'We support JPG, PNG, and WebP images. By default, images are converted to JPG for maximum compression.' },
      { question: 'Why does my PNG look different?', answer: 'When converting a transparent PNG to JPG to save space, the transparent background is filled with a white color.' }
    ]
  },
  {
    slug: 'compress-image-to-50kb',
    title: 'Compress Image to 50 KB',
    description: 'Compress your image to 50 KB online directly in your browser.',
    type: 'compressor',
    category: 'photo',
    targetKB: 50,
    guideText: 'If your application requires a photo under 50 KB, use our free tool to resize and compress it instantly. No signup or software installation is required. We use advanced browser-based compression to shrink the file size while preserving its clarity. Please make sure to review your specific exam or form guidelines for exact dimensions before converting.',
    faqs: [
      { question: 'Can I upload a raw image from my phone?', answer: 'Yes! You can directly upload photos taken with your phone or select from your gallery.' },
      { question: 'Do I have to pay to use this?', answer: 'No, this tool is completely free with no usage limits.' },
      { question: 'How is the image compressed?', answer: 'The tool uses HTML5 Canvas and binary compression algorithms to incrementally lower image quality until the 50 KB target is reached.' },
      { question: 'Are there any limits on file size?', answer: 'While there is no strict limit, uploading extremely large files (over 15MB) may cause your browser to slow down.' }
    ]
  },
  {
    slug: 'compress-image-to-100kb',
    title: 'Compress Image to 100 KB',
    description: 'Fast, secure, in-browser image compression to 100 KB.',
    type: 'compressor',
    category: 'photo',
    targetKB: 100,
    guideText: 'Large photos can be difficult to upload to online portals. With our 100 KB image compressor, you can downsize any picture in seconds. Everything happens in your browser for maximum privacy. Whether you need to compress a travel photo, a signature, or an ID photograph, simply upload and download. Always double-check official size rules to ensure your final image meets their criteria.',
    faqs: [
      { question: 'Why won\'t my image reach 100 KB?', answer: 'If an image has extremely large dimensions, the tool will automatically scale down the physical size (resolution) until it can hit the 100 KB target.' },
      { question: 'Where are my images saved?', answer: 'Images are processed locally and only stay on your device. We do not store any user images.' },
      { question: 'Does this tool support WebP?', answer: 'Yes, you can upload WebP files and also choose WebP as an output format for better compression.' },
      { question: 'Can I use this on mobile?', answer: 'Yes, the site works perfectly on any modern smartphone browser.' }
    ]
  },
  {
    slug: 'compress-image-to-200kb',
    title: 'Compress Image to 200 KB',
    description: 'Reduce image file sizes to 200 KB in a single click.',
    type: 'compressor',
    category: 'photo',
    targetKB: 200,
    guideText: 'A 200 KB limit is standard for many government, education, and professional forms. This tool provides an easy way to hit that target precisely. It handles both resizing and re-compression without sending your data across the internet. Remember that outcomes vary depending on how complex the original image is, but the tool will do its best to keep it sharp and under 200 KB.',
    faqs: [
      { question: 'How do I check the final file size?', answer: 'Once compressed, the tool will display the original size, the new size, and the final dimensions before you download.' },
      { question: 'Are there any watermarks added?', answer: 'No, we never add any watermarks to your images.' },
      { question: 'What browsers are recommended?', answer: 'We recommend modern browsers like Chrome, Firefox, Safari, or Edge for the best performance.' },
      { question: 'How do I restart the process?', answer: 'Simply click the "Try another image" button or drop a new image into the designated area.' }
    ]
  },

  // --- PHOTO TOOLS: RESIZER ---
  {
    slug: 'resize-photo-to-200x230-pixels',
    title: 'Resize photo to 200x230 pixels',
    description: 'Quickly resize your photo to exactly 200x230 pixels directly in your browser.',
    type: 'resizer',
    category: 'photo',
    defaultMode: 'preset',
    defaultPreset: '200x230px',
    popular: true,
    guideText: 'Need an image exactly 200 by 230 pixels? Our secure, browser-based resizing tool crop-fits your photo accurately without distortion. It centers your image and crops the excess, guaranteeing the final file matches the precise required pixels. Please remember, we provide this as a generic tool; always refer to your specific application portal\'s official rules to ensure a 200x230px output is what they require.',
    faqs: [
      { question: 'Does this tool distort the image?', answer: 'No, we use a crop-to-fill technique. If the original photo has a different aspect ratio, we preserve the proportions and simply crop away the excess edges.' },
      { question: 'Can I change it to something other than 200x230?', answer: 'Yes! After uploading, you can manually select "By pixels" and enter any custom width and height.' },
      { question: 'Are my images secure?', answer: 'Absolutely. We perform all canvas drawing and resizing locally on your device. No images are sent to any server.' },
      { question: 'Can I compress the file size too?', answer: 'Yes, there is an optional field to set a target KB size after you choose your dimensions.' }
    ]
  },
  {
    slug: 'resize-photo-to-passport-size-35x45mm',
    title: 'Resize photo to passport size (35mm x 45mm)',
    description: 'Resize your photo to standard 35x45mm dimensions for passports and visas.',
    type: 'resizer',
    category: 'photo',
    defaultMode: 'preset',
    defaultPreset: '35x45mm',
    guideText: 'The 35mm x 45mm preset provides a standard dimension commonly requested for ID, passport, and visa photos globally. When standardizing physical mm sizes digitally, we assume a professional print resolution of 300 DPI, converting 35x45mm to approximately 413x531 pixels. Always check your specific form\'s requirements, as official standards differ slightly by form and organization.',
    faqs: [
      { question: 'How does mm convert to pixels?', answer: 'We use an industry-standard 300 DPI (Dots Per Inch) for conversion. At this density, 35mm x 45mm equals exactly 413 x 531 pixels.' },
      { question: 'Does the tool automatically frame my face?', answer: 'The tool centers the crop, but does not use facial recognition. We recommend uploading a photo where your face is already centered.' },
      { question: 'What file format will I get?', answer: 'You can choose between JPG, PNG, or WebP. JPG is selected by default.' },
      { question: 'What if my photo looks cut off?', answer: 'If too much of your image is cropped, try switching to "By pixels" and turning on "Keep aspect ratio", though this changes the final dimensions.' }
    ]
  },
  {
    slug: 'resize-image-by-pixels',
    title: 'Resize image by pixels',
    description: 'A free tool to resize images to custom pixel dimensions with aspect ratio lock.',
    type: 'resizer',
    category: 'photo',
    defaultMode: 'pixels',
    guideText: 'Whether you are formatting an image for social media, a blog post, or a strict upload requirement, our general-purpose pixel resizer makes it easy. You can link the width and height to keep your original aspect ratio, or unlink them to perform a center-crop to an exact size. If you input both width and height without the aspect link, your image will cleanly crop-to-fill the target box instead of looking stretched and distorted.',
    faqs: [
      { question: 'What does "Keep aspect ratio" mean?', answer: 'It means the proportional relationship between the width and height is locked. If you change the width, the height adjusts automatically so the image doesn\'t stretch.' },
      { question: 'What happens if I turn off aspect ratio lock?', answer: 'If you specify a new width and height manually, the image will center itself over that shape and crop off whatever doesn\'t fit, guaranteeing your exact dimensions without distortion.' },
      { question: 'Is my data private?', answer: 'Yes, everything happens securely in your web browser. No data leaves your machine.' },
      { question: 'Can I achieve a specific file size?', answer: 'Yes, you can check the "Compress to target KB" option and enter your desired maximum file size.' }
    ]
  },

  // --- SIGNATURE TOOLS ---
  {
    slug: 'signature-resizer-for-exam-forms',
    title: 'Signature resizer for exam forms',
    description: 'Resize and compress your signature to fit exam submission requirements.',
    type: 'signature',
    category: 'signature',
    defaultMode: 'preset',
    defaultPreset: '140x60px',
    defaultTargetKB: 20,
    popular: true,
    guideText: 'Many online exam portals require signatures to be resized to specific dimensions and file sizes. Our signature resizer tool handles both requirements seamlessly. Simply upload a photo or scan of your signature, choose a preset size or enter custom dimensions, and optionally compress to a target KB. The tool uses a center-crop approach to preserve the full width of your signature without distortion. Always verify your exam\'s specific requirements before submitting.',
    faqs: [
      { question: 'Can I upload a scanned signature?', answer: 'Yes, both photographed and scanned signatures work perfectly. The tool will auto-detect and use the signature area.' },
      { question: 'Will my signature look different after resizing?', answer: 'The resizing preserves your signature\'s proportions through center-cropping. If the aspect ratio doesn\'t match, excess space is cropped equally from all sides.' },
      { question: 'Can I clean up the background?', answer: 'Yes, enable the "Auto white background" toggle to convert greyish or cream backgrounds to pure white, as many forms require.' },
      { question: 'Is this secure?', answer: 'Absolutely. All processing happens in your browser. Your signature is never uploaded anywhere.' }
    ]
  },
  {
    slug: 'resize-signature-to-20kb',
    title: 'Resize signature to 20 KB',
    description: 'Compress your signature to exactly 20 KB for exam and form submissions.',
    type: 'signature',
    category: 'signature',
    defaultMode: 'preset',
    defaultPreset: '140x60px',
    defaultTargetKB: 20,
    guideText: 'A 20 KB signature file is a common requirement for online examinations and government form submissions. Our tool automatically resizes your signature to a standard size and compresses it to precisely 20 KB. Upload your signature (scanned or photographed), and the tool handles both the dimensional resizing and file size compression. Always check your specific form\'s instructions for any additional signature requirements like dimensions or color format.',
    faqs: [
      { question: 'What size will my signature be after resizing?', answer: 'By default, the tool resizes to 140 x 60 pixels, a common standard for signatures. You can change this to any custom size before downloading.' },
      { question: 'Does the 20 KB limit affect quality?', answer: 'The tool intelligently balances quality and file size. For most signatures, the result remains crisp and legible even at 20 KB.' },
      { question: 'Can I adjust the preset size?', answer: 'Yes, after uploading, click "Custom size" to enter any width and height you prefer.' },
      { question: 'What if my signature is very cursive and ornate?', answer: 'Complex signatures may require slightly more file space. The tool will alert you if it cannot reach exactly 20 KB; you can then adjust the dimensions slightly.' }
    ]
  },
  {
    slug: 'resize-signature-to-140x60-pixels',
    title: 'Resize signature to 140x60 pixels',
    description: 'Quickly resize your signature to 140x60 pixels, a standard dimension for forms.',
    type: 'signature',
    category: 'signature',
    defaultMode: 'preset',
    defaultPreset: '140x60px',
    guideText: 'The 140 x 60 pixel preset is a widely used standard for signature fields in online forms and exams. Our tool crop-fits your signature to this exact size while preserving its proportions and readability. Simply upload your signature and download the resized version. If you also need to hit a specific file size limit, enable the "Compress to target KB" option and specify your required size.',
    faqs: [
      { question: 'Is 140x60 the right size for my form?', answer: 'It\'s a common standard, but always check your specific form\'s instructions. If they require different dimensions, you can switch to "Custom size" after uploading.' },
      { question: 'Will my signature be cut off?', answer: 'The tool uses intelligent center-cropping to fit your signature into the 140x60 space while keeping the core signature intact. If too much is cut, try the general "Resize image by pixels" tool with aspect ratio lock enabled.' },
      { question: 'Can I also compress the file size?', answer: 'Yes, toggle "Compress to target KB" and enter your desired file size (e.g., 20 KB or 50 KB).' },
      { question: 'Should the background be white?', answer: 'Many forms prefer white backgrounds. Use the "Auto white background" toggle to convert grey or cream backgrounds to pure white.' }
    ]
  },

  // --- FORMAT CONVERTER TOOLS ---
  {
    slug: 'convert-jpg-to-png',
    title: 'Convert JPG to PNG',
    description: 'Convert JPG images to PNG format with lossless compression.',
    type: 'compressor',
    category: 'photo',
    guideText: 'Converting JPG to PNG is useful when you need lossless compression or require transparency support. PNG format preserves image quality without any loss and supports transparent backgrounds, making it ideal for graphics, logos, and images that need to be layered over different backgrounds. Simply upload your JPG file, select PNG as the output format, and download. Keep in mind that PNG files are typically larger than JPG for photographic images, so consider your storage and bandwidth needs before converting.',
    faqs: [
      { question: 'Will the conversion affect image quality?', answer: 'No, PNG uses lossless compression, so your image quality remains identical to the original JPG. However, PNG files are usually larger due to the lossless format.' },
      { question: 'Can I add transparency to a JPG when converting to PNG?', answer: 'No, JPG images don\'t contain transparency data. When you convert, the image remains opaque. To add transparency, you\'d need image editing software.' },
      { question: 'Is there a file size limit?', answer: 'Our tool accepts files up to 15MB. Extremely large files may take longer to process.' },
      { question: 'Do I need to install software?', answer: 'No, this tool runs entirely in your browser. No downloads or installations required.' }
    ]
  },
  {
    slug: 'convert-png-to-jpg',
    title: 'Convert PNG to JPG',
    description: 'Convert PNG images to JPG format with adjustable quality.',
    type: 'compressor',
    category: 'photo',
    guideText: 'Converting PNG to JPG is ideal when you need smaller file sizes for sharing or uploading. JPG uses lossy compression, which can dramatically reduce file size while maintaining acceptable visual quality for photographs. If your PNG contains transparency, it will be replaced with a white background during conversion. This tool lets you adjust the quality slider to find the perfect balance between file size and image clarity. Always keep a backup of your original PNG before converting if you need to preserve transparency or require lossless quality.',
    faqs: [
      { question: 'What happens to transparent areas in my PNG?', answer: 'Transparent areas are automatically filled with white color when converting to JPG, as JPG does not support transparency.' },
      { question: 'How much smaller will the file be?', answer: 'JPG files are typically 50-80% smaller than PNG files for photographs, depending on the image content and quality settings.' },
      { question: 'Can I control the output quality?', answer: 'Yes, use the quality slider to balance between file size and visual quality. Higher quality means larger file size.' },
      { question: 'Is the conversion reversible?', answer: 'Once converted to JPG, you cannot restore the original PNG transparency. Always keep your original files.' }
    ]
  },
  {
    slug: 'convert-image-to-webp',
    title: 'Convert image to WebP',
    description: 'Convert JPG and PNG images to modern WebP format for better compression.',
    type: 'compressor',
    category: 'photo',
    guideText: 'WebP is a modern image format that offers superior compression compared to JPG and PNG. Developed by Google, WebP can reduce file sizes by 25-35% compared to JPG while maintaining the same visual quality, making it excellent for web use and improving page load times. This tool converts your existing JPG or PNG images to WebP format with adjustable quality settings. WebP is widely supported by modern browsers but may not be compatible with older devices or applications. For maximum compatibility, keep both your original format and WebP versions available.',
    faqs: [
      { question: 'What are the benefits of WebP?', answer: 'WebP offers better compression than JPG and PNG, reducing file sizes by 25-35% while maintaining quality. It supports both lossy and lossless compression and can include transparency.' },
      { question: 'Is WebP supported by all browsers?', answer: 'WebP is supported by most modern browsers (Chrome, Firefox, Edge, Opera). Safari has added support in recent versions, but some older devices may not support it.' },
      { question: 'Can I convert PNG with transparency to WebP?', answer: 'Yes, WebP supports transparency, so your PNG transparency will be preserved during conversion.' },
      { question: 'How much smaller will my file be?', answer: 'WebP typically reduces file size by 25-35% compared to JPG for similar quality, and can be even smaller than PNG for images with transparency.' }
    ]
  },

  // --- PDF TOOLS: JPG TO PDF ---
  {
    slug: 'convert-jpg-to-pdf',
    title: 'Convert JPG to PDF',
    description: 'Convert a single JPG image to a PDF document with custom page sizing.',
    type: 'compressor',
    category: 'pdf',
    popular: true,
    guideText: 'Converting a JPG to PDF is useful when you need to share images in a universally compatible document format. Our tool lets you upload a JPG image and instantly create a PDF with your choice of page size (A4, Letter, or fitted to the image). You can add a small margin around the image if desired. The conversion happens entirely in your browser — your image is never uploaded to any server. Choose "Fit to image" to create a PDF page that matches your photo\'s exact dimensions.',
    faqs: [
      { question: 'Can I convert multiple JPGs to one PDF?', answer: 'Yes, use our "Convert multiple photos to one PDF" tool to merge multiple images into a single document.' },
      { question: 'What page sizes are available?', answer: 'We offer A4, Letter, and "Fit to image" which creates a page matching your image\'s dimensions.' },
      { question: 'Can I add margins?', answer: 'Yes, you can choose between no margin or a small margin around the image on the page.' },
      { question: 'Is my image compressed?', answer: 'The image quality is preserved in the PDF. File size depends on the image size and page layout you choose.' }
    ]
  },
  {
    slug: 'convert-multiple-photos-to-one-pdf',
    title: 'Convert multiple photos to one PDF',
    description: 'Merge multiple JPG and PNG images into a single PDF document.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Combine multiple photos into one PDF document with our easy-to-use tool. Upload up to 20 images, reorder them by dragging the up/down buttons, and customize the page size, orientation, and margins. Each image is placed on its own page, automatically scaled to fit your chosen page size while preserving the aspect ratio. The tool detects the orientation of each photo and can maintain it or force all pages to be portrait or landscape. Everything happens securely in your browser with no upload to any server.',
    faqs: [
      { question: 'How do I reorder images?', answer: 'Use the up (↑) and down (↓) buttons next to each image in the list to rearrange them before generating the PDF.' },
      { question: 'Can each image have a different page size?', answer: 'Not directly, but you can choose "Fit to image" orientation, which sizes each page to match that individual image\'s dimensions.' },
      { question: 'What is the maximum number of images?', answer: 'You can add up to 20 images per PDF. If you have more, create multiple PDFs.' },
      { question: 'How large can the total file size be?', answer: 'The combined size of all images must not exceed 50 MB. For very high-resolution photos, you may need to reduce the number of images.' }
    ]
  },
  {
    slug: 'merge-images-into-a-single-pdf-document',
    title: 'Merge images into a single PDF document',
    description: 'Combine JPG and PNG files into one organized PDF with professional layout options.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Merge a collection of JPG and PNG images into a single, organized PDF document. Our tool supports uploading multiple images at once, reordering them, and choosing from professional layout options like A4 and Letter page sizes, portrait or landscape orientation, and optional margins. Each image is intelligently scaled to fit the chosen page size while maintaining its aspect ratio and staying centered on the page. This is ideal for creating photo albums, scanning results, documentation compilations, or any scenario where you need to combine multiple images into one portable document.',
    faqs: [
      { question: 'Can I mix JPG and PNG images in the same PDF?', answer: 'Yes, you can upload and merge JPG and PNG files together in any order.' },
      { question: 'Do transparent PNGs stay transparent in the PDF?', answer: 'PNG transparency is preserved in the PDF, but will appear against a white background when printed or viewed.' },
      { question: 'What does "Auto" orientation do?', answer: '"Auto" maintains each image\'s original orientation — portrait images stay portrait, landscape images stay landscape.' },
      { question: 'Can I remove an image after uploading?', answer: 'Yes, click the ✕ button next to any image to remove it from the list before generating the PDF.' }
    ]
  },

  // --- PDF TOOLS: MERGE PDF ---
  {
    slug: 'merge-pdf-files-online',
    title: 'Merge PDF files online',
    description: 'Combine multiple PDF documents into a single file with custom page selection.',
    type: 'compressor',
    category: 'pdf',
    popular: true,
    guideText: 'Merging multiple PDF files into one is a quick way to organize and share related documents. Our online PDF merger lets you upload up to 20 PDFs, reorder them, and optionally select specific page ranges from each file before combining. For example, you can include pages 1-5 from one PDF and pages 10-15 from another. The merging happens entirely in your browser — your PDFs never leave your device or get uploaded to any server. Simply upload your files, arrange them, and download the merged result.',
    faqs: [
      { question: 'Can I choose which pages to include?', answer: 'Yes, for each PDF you can specify a page range like "1-3" or individual pages like "1,3,5". Leave it blank or type "all" to include all pages.' },
      { question: 'Does the tool preserve the original formatting?', answer: 'Yes, your PDFs are merged as-is, preserving all original formatting, fonts, images, and layouts.' },
      { question: 'What happens with password-protected PDFs?', answer: 'Password-protected or corrupted PDFs cannot be merged. The tool will show a clear error message identifying which file caused the problem.' },
      { question: 'Is there a limit on file size?', answer: 'You can merge up to 20 PDF files with a total size not exceeding 100 MB.' }
    ]
  },
  {
    slug: 'combine-multiple-pdfs-into-one',
    title: 'Combine multiple PDFs into one',
    description: 'Easily merge multiple PDF documents into a single file.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Combine multiple PDFs into one organized document with just a few clicks. Our tool supports uploading multiple PDF files at once, reordering them by dragging or using up/down buttons, and even selecting specific page ranges if you don\'t want all pages from each file. This is perfect for compiling reports, assembling contracts, combining scan batches, or merging any collection of PDF documents. Everything is processed securely in your browser with no uploads to any server. The merged PDF maintains all original formatting and is ready to download immediately.',
    faqs: [
      { question: 'How do I reorder PDFs?', answer: 'Use the up (↑) and down (↓) buttons next to each PDF to rearrange them. They will be merged in the order shown.' },
      { question: 'Can I merge just parts of each PDF?', answer: 'Yes, specify a page range for each PDF using formats like "1-3", "all", or "1,3,5" to include specific pages.' },
      { question: 'What if I make a mistake in the page range?', answer: 'If the page range is invalid (e.g., exceeds the PDF\'s page count), the tool will show an error message when you try to merge.' },
      { question: 'Is my data private?', answer: 'Yes, all PDF processing happens locally in your browser. Your files are never sent to any server.' }
    ]
  },
  {
    slug: 'join-pdf-documents-free',
    title: 'Join PDF documents free',
    description: 'Free online tool to join multiple PDF files into a single document.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Join multiple PDF documents into one without spending money on premium software. Our free PDF joiner runs entirely in your web browser, requiring no installation, registration, or subscription. Upload your PDFs, arrange them in any order, optionally specify which pages to include from each file, and download the merged result in seconds. The tool handles up to 20 files and 100 MB total, making it ideal for personal, professional, and business use. Your privacy is protected — all processing happens locally on your device.',
    faqs: [
      { question: 'Is this tool really free?', answer: 'Yes, completely free with no hidden charges, ads, or premium features.' },
      { question: 'Do I need to install anything?', answer: 'No, this tool runs entirely in your web browser. No software installation or account setup required.' },
      { question: 'Can I use this on my phone?', answer: 'Yes, this tool works on all modern smartphones and tablets with a web browser.' },
      { question: 'How many PDFs can I merge at once?', answer: 'You can merge up to 20 PDF files per merge operation. If you have more, you can create multiple merged PDFs and combine them again.' }
    ]
  },

  // --- PDF TOOLS: SPLIT PDF ---
  {
    slug: 'split-pdf-into-multiple-files',
    title: 'Split PDF into multiple files',
    description: 'Split a PDF document into separate files or extract specific pages.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Split large PDF files into smaller, more manageable documents with our free online tool. Choose from three split modes: extract a specific page range into one new PDF, split into individual page files (one page per PDF), or split at a chosen page number to create two documents. The tool handles everything in your browser — your PDF never leaves your device or gets uploaded to any server. Multiple output files are packaged in a ZIP archive for easy download. This is perfect for organizing large documents, sharing individual pages, or splitting scans.',
    faqs: [
      { question: 'What split modes are available?', answer: 'Three modes: extract a page range like "1-3", split each page into its own PDF, or split at a specific page number to create two documents.' },
      { question: 'Can I extract multiple non-consecutive pages?', answer: 'Yes, use the extract mode with a list like "1,3,5" to pull out those specific pages into one PDF.' },
      { question: 'How are multiple files packaged?', answer: 'When splitting creates multiple files (e.g., one per page), they are automatically packaged into a ZIP file for download.' },
      { question: 'What\'s the file size limit?', answer: 'PDFs up to 50 MB can be split. Files over 100 pages may process slowly.' }
    ]
  },
  {
    slug: 'extract-pages-from-pdf',
    title: 'Extract pages from PDF',
    description: 'Extract specific pages from a PDF into a new document.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Extract specific pages from a PDF document into a new, smaller file. Simply upload your PDF, enter the page numbers or range you want to keep (e.g. "1-5" or "1,3,7"), and the tool creates a new PDF containing only those pages. This is useful for isolating sections of a larger document, removing unwanted pages, or creating focused documents from comprehensive sources. All processing happens securely in your browser with no uploads to any server. The extracted PDF maintains all original formatting and quality.',
    faqs: [
      { question: 'How do I specify which pages to extract?', answer: 'Enter a range like "1-5" for pages 1 through 5, or a list like "1,3,5" for individual pages. You can combine both: "1-3,7,9-10".' },
      { question: 'Is the page numbering 1-based or 0-based?', answer: 'Pages are numbered starting from 1 (the first page), so "1" extracts the first page.' },
      { question: 'Will the extracted PDF look the same as the original?', answer: 'Yes, all formatting, images, and text are preserved exactly as they were in the original PDF.' },
      { question: 'Can I edit the extracted PDF afterward?', answer: 'The extracted PDF is a standard PDF file. You can open it in any PDF editor or viewer for further modifications.' }
    ]
  },
  {
    slug: 'split-pdf-by-page-number',
    title: 'Split PDF by page number',
    description: 'Divide a PDF into two parts at a specific page.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Quickly split a PDF into two separate documents at a specific page. Upload your PDF, choose the page where you want to split, and the tool creates two new PDFs: one containing all pages before the split point, and one containing the split point and all following pages. This is ideal for dividing long documents in half, separating chapters, or organizing multi-section files. Everything happens securely in your browser. Both resulting PDFs are packaged in a ZIP archive for easy download.',
    faqs: [
      { question: 'What page number should I enter?', answer: 'Enter the page number where the split should occur. Pages before it go into the first PDF, and that page onward goes into the second PDF.' },
      { question: 'Can I split a 10-page PDF at page 5?', answer: 'Yes, that creates one PDF with pages 1-4 and another with pages 5-10.' },
      { question: 'Are the filenames descriptive?', answer: 'Yes, each file is named to show its page range (e.g., "part-1-pages-1-to-4.pdf" and "part-2-pages-5-to-10.pdf").' },
      { question: 'What if I want to split at multiple points?', answer: 'You can split once per operation. For multiple splits, process the resulting PDFs separately or use the extract mode for more control.' }
    ]
  },

  // --- PDF TOOLS: COMPRESS PDF ---
  {
    slug: 'compress-pdf-to-100kb',
    title: 'Compress PDF to 100 KB',
    description: 'Reduce PDF file size to 100 KB with configurable compression levels.',
    type: 'compressor',
    category: 'pdf',
    targetKB: 100,
    popular: true,
    guideText: 'Compress your PDF files to 100 KB for easy sharing, email, or upload. Our tool uses structural optimization and image re-compression to reduce file size. Be aware that compression effectiveness depends heavily on PDF content: scanned documents and photo-based PDFs compress well (30-70% reduction), while text-heavy PDFs barely shrink because text is already compressed. Choose a compression level that balances file size and quality for your needs. The tool runs entirely in your browser — your PDF never leaves your device.',
    faqs: [
      { question: 'Why doesn\'t my text-heavy PDF compress much?', answer: 'Text in PDFs is already stored efficiently. Significant compression would require removing content or degrading readability. Scanned/photo PDFs compress much better.' },
      { question: 'What compression level should I use?', answer: 'Low (75% quality) is best for documents where clarity matters. Medium (60%) for general use. High (40%) only if you need maximum compression and can accept visible quality loss.' },
      { question: 'Can I reach exactly 100 KB?', answer: 'The tool tries its best but cannot guarantee an exact size. Some PDFs may not compress to 100 KB without significant quality loss or content removal.' },
      { question: 'Does compression affect readability?', answer: 'Image-based PDFs (scans, photos) remain readable at medium compression. Text should not be affected. High compression may cause visible artifacts.' }
    ]
  },
  {
    slug: 'compress-pdf-to-200kb',
    title: 'Compress PDF to 200 KB',
    description: 'Compress PDF documents to 200 KB with minimal quality loss.',
    type: 'compressor',
    category: 'pdf',
    targetKB: 200,
    guideText: 'Compress your PDF to 200 KB, a common limit for document uploads and email attachments. Our compression tool optimizes the PDF structure and re-compresses images while preserving document quality. Results depend on content: image-heavy PDFs (scans, photos) compress significantly, while text-only PDFs see little reduction. The tool intelligently detects the PDF type and gives you honest feedback about what was achieved. All processing happens securely in your browser with no uploads to any server.',
    faqs: [
      { question: 'What\'s the difference between compression levels?', answer: 'Low preserves maximum quality (75%), Medium balances quality and size (60%), High prioritizes size reduction (40%). Choose based on your readability needs.' },
      { question: 'Can I compress a PDF that\'s already under 200 KB?', answer: 'Yes, the tool will attempt to compress it further. However, already-compressed PDFs may not shrink much.' },
      { question: 'Is the compressed PDF still searchable?', answer: 'If the original PDF was searchable text, the compressed version remains searchable. Image-based PDFs stay image-based.' },
      { question: 'What formats does the tool support?', answer: 'Standard PDF files. Password-protected, corrupted, or encrypted PDFs cannot be compressed.' }
    ]
  },
  {
    slug: 'compress-pdf-to-500kb',
    title: 'Compress PDF to 500 KB',
    description: 'Reduce PDF file size to 500 KB while preserving document quality.',
    type: 'compressor',
    category: 'pdf',
    targetKB: 500,
    guideText: 'Compress PDFs to 500 KB for sharing, storage, or platform uploads with a 500 KB limit. This target is usually achievable for most PDFs with minimal quality impact. Our tool uses two-phase compression: first structural optimization, then intelligent image re-compression. Photo-based and scanned PDFs compress best; text-heavy PDFs see limited reduction. The tool provides honest feedback about what was achieved — if the target couldn\'t be reached, it explains why (e.g., "mostly text, already efficient") rather than claiming false success.',
    faqs: [
      { question: 'Why does the tool tell me when compression fails?', answer: 'Honest feedback is important. Some PDFs cannot reach aggressive targets without unacceptable quality loss. We show you the best result achieved and explain why.' },
      { question: 'How much smaller can a scanned PDF typically get?', answer: 'Scanned documents often compress 40-70% depending on original quality and resolution. A 2 MB scan might become 600 KB-1 MB.' },
      { question: 'Is there a risk of data loss?', answer: 'No, compression only affects image quality and file structure, not content. Text, annotations, and links remain intact.' },
      { question: 'Can I try different compression levels?', answer: 'Yes, use Start Over and choose a different level to experiment. Low/Medium usually produce good results for most PDFs.' }
    ]
  },

  // --- PDF TOOLS: ROTATE PDF ---
  {
    slug: 'rotate-pdf-pages-online',
    title: 'Rotate PDF pages online',
    description: 'Rotate PDF pages clockwise, counter-clockwise, or flip upside down.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Fix sideways or incorrectly oriented PDF pages with our free online PDF rotator. Upload a PDF and choose to rotate all pages or select specific pages. Each page can be rotated 90° clockwise, 90° counter-clockwise, or 180° (upside down). This is perfect for scanned documents that came out rotated, photos imported at the wrong angle, or any PDF page that needs orientation correction. All processing happens securely in your browser — your PDF never leaves your device. The rotated PDF is ready to download immediately.',
    faqs: [
      { question: 'Can I rotate only some pages?', answer: 'Yes, choose "Rotate selected pages" and enter the page numbers (e.g., "1,3,5" or "1-3") that need rotating.' },
      { question: 'What rotation angles are available?', answer: 'You can rotate 90° clockwise, 90° counter-clockwise, or 180° (upside down). You can apply rotation multiple times by starting over.' },
      { question: 'Will the rotation affect PDF quality?', answer: 'No, rotation is a non-destructive operation. PDF quality and all content remain unchanged; only the page orientation changes.' },
      { question: 'Can I rotate password-protected PDFs?', answer: 'No, password-protected PDFs cannot be processed. The tool will show an error message if you try to upload one.' },
      { question: 'Is there a file size limit?', answer: 'PDFs up to 50 MB can be rotated. For very large files, the operation may take a few seconds.' }
    ]
  },
  {
    slug: 'fix-sideways-or-upside-down-pdf-pages',
    title: 'Fix sideways or upside-down PDF pages',
    description: 'Correct the orientation of rotated PDF pages in seconds.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Scanned documents often end up sideways or upside down due to scanner orientation or document feeding errors. This tool lets you quickly fix those pages without re-scanning. Upload your misaligned PDF, select which pages need correction, and rotate them to the correct angle. You can rotate all pages at once or target specific pages. The tool supports 90° clockwise, 90° counter-clockwise, and 180° rotations. Everything runs in your browser for complete privacy — your PDF stays on your device throughout the process.',
    faqs: [
      { question: 'How do I know which rotation to use?', answer: 'Choose 90° clockwise if the page is rotated left, 90° counter-clockwise if rotated right, and 180° if the page is upside down.' },
      { question: 'Can I rotate all pages in my PDF?', answer: 'Yes, select "Rotate all pages" and choose your angle. All pages will be rotated uniformly.' },
      { question: 'What if some pages need different rotations?', answer: 'You can only apply one rotation per operation. If pages need different angles, you can use the tool multiple times with different page selections.' },
      { question: 'Does rotation save the original PDF?', answer: 'No, the tool creates a new rotated PDF to download. Your original PDF is not modified.' },
      { question: 'Is the rotated PDF compatible with all readers?', answer: 'Yes, the rotated PDF is a standard PDF file that opens in any PDF reader or browser.' }
    ]
  },

  // --- PDF TOOLS: REMOVE PAGES ---
  {
    slug: 'remove-pages-from-pdf',
    title: 'Remove pages from PDF',
    description: 'Delete unwanted pages from your PDF document online.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Remove unwanted pages from your PDF with ease using our free online tool. Upload your PDF, select the pages you want to delete by entering page numbers (e.g., "2,4,7-9") or checking boxes, and download the cleaned-up document. The tool preserves the original order of remaining pages and maintains all formatting and content quality. This is perfect for removing blank pages, duplicate scans, cover pages, or any sections you don\'t need. Everything runs securely in your browser — your PDF never leaves your device. You must keep at least one page in the final document.',
    faqs: [
      { question: 'How do I select pages to remove?', answer: 'You can either enter page numbers in the text field (e.g., "2,4,7-9") or switch to checkbox mode and click the pages you want to delete.' },
      { question: 'Can I remove multiple non-contiguous pages?', answer: 'Yes, enter them separated by commas. For example, "2,5,8" removes pages 2, 5, and 8.' },
      { question: 'Can I use ranges to remove pages?', answer: 'Yes, use a hyphen for ranges. For example, "1-5,10" removes pages 1 through 5 and page 10.' },
      { question: 'What if I want to keep only certain pages?', answer: 'Remove all the pages you don\'t want. The tool will keep the remaining pages in their original order.' },
      { question: 'Can I remove all pages?', answer: 'No, you must keep at least one page. The tool will show an error if you try to remove every page.' }
    ]
  },
  {
    slug: 'delete-unwanted-pdf-pages-online',
    title: 'Delete unwanted PDF pages online',
    description: 'Easily delete specific pages from your PDF document.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Need to trim down a long PDF by removing unnecessary pages? Our free online tool makes it simple. Upload your PDF, identify which pages to delete, and generate a new document with just the pages you need. Choose between typing page numbers (supporting ranges like "5-10" and individual selections like "2,7,9") or using an interactive checkbox interface to click the pages to remove. The resulting PDF is smaller, cleaner, and ready to share or archive. All processing happens in your browser for complete privacy and security.',
    faqs: [
      { question: 'Is there a limit on PDF file size?', answer: 'You can upload PDFs up to 50 MB. Larger files may take longer to process.' },
      { question: 'Will deleting pages affect the remaining pages?', answer: 'No, deleting pages does not modify the content of remaining pages. They maintain their original formatting and quality.' },
      { question: 'Can I undo if I delete the wrong pages?', answer: 'No, but you can use "Start over" to reload the PDF and make a new selection. Your original PDF remains unchanged.' },
      { question: 'What file formats are supported?', answer: 'Only PDF files are supported. Password-protected PDFs cannot be processed.' }
    ]
  },

  // --- PDF TOOLS: EXTRACT PAGES ---
  {
    slug: 'extract-pages-from-pdf-file',
    title: 'Extract pages from PDF file',
    description: 'Extract and save specific pages from your PDF as a new document.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Extract specific pages from a PDF document into a new file without modifying the original. Upload your PDF, select the pages you want to keep using either a text input (e.g., "1,3,5-7") or by clicking checkboxes, and download the new PDF containing only those pages. This tool is perfect for isolating chapters from a book, saving important sections, splitting long documents, or preparing materials for sharing. Pages are extracted in their original document order to maintain context and readability. All extraction happens securely in your browser with no uploads to any server.',
    faqs: [
      { question: 'How do I extract pages 1 through 5?', answer: 'Enter "1-5" in the text input, or use checkbox mode and click pages 1-5. Both methods work equally well.' },
      { question: 'Can I extract non-consecutive pages?', answer: 'Yes! Enter them separated by commas, like "1,3,7" or mix ranges and individual pages like "1-3,7,9-10".' },
      { question: 'In what order will the extracted pages appear?', answer: 'Pages are always extracted in their original document order, not the order you specify. This preserves context and document flow.' },
      { question: 'What happens to the original PDF?', answer: 'Your original PDF is never modified. The tool creates a new PDF containing only your selected pages.' },
      { question: 'Is there a minimum number of pages I must extract?', answer: 'You must select at least one page. There is no maximum; you can extract all pages if desired.' }
    ]
  },
  {
    slug: 'save-specific-pdf-pages-as-new-file',
    title: 'Save specific PDF pages as a new file',
    description: 'Extract selected PDF pages and save them as a standalone document.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Quickly extract and save specific pages from your PDF without complex editing software. Select the pages you need from your document and generate a new PDF containing only those pages. Our tool supports both simple ranges (e.g., "5-10") and complex selections (e.g., "2,5-7,9"). Use checkbox mode to visually select pages or type mode for fast entry. Perfect for creating custom documents, extracting research sections, saving specific chapters, or preparing handouts. Everything runs in your browser for complete privacy.',
    faqs: [
      { question: 'Can I extract pages in a different order than the original?', answer: 'Pages are always extracted in their original document order to maintain context. If you need pages reordered, extract them first, then merge in your preferred order using the Merge PDF tool.' },
      { question: 'How large can the extracted PDF be?', answer: 'The original PDF can be up to 50 MB. The extracted PDF will be smaller depending on which pages you select.' },
      { question: 'Does extraction affect image quality or formatting?', answer: 'No, all formatting, images, and text styling are preserved exactly as they appear in the original PDF.' },
      { question: 'Can I extract from a scanned PDF (image-based)?', answer: 'Yes, image-based PDFs work perfectly. The tool preserves the scanned images with their original quality.' }
    ]
  },

  // --- PDF TOOLS: ADD PAGE NUMBERS ---
  {
    slug: 'add-page-numbers-to-pdf',
    title: 'Add page numbers to PDF',
    description: 'Add customizable page numbers to your PDF with multiple format and position options.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Add professional page numbers to your PDF document with full customization. Choose from six positions (top or bottom, left/center/right), three number formats (plain digits, "Page X", or "X of N"), and adjustable font sizes. Optionally skip the first page, useful for documents with cover pages. Set a custom starting number for PDFs that are part of larger documents. Our tool preserves all formatting and content while adding clear, readable page numbers. Perfect for creating professional documents, multi-part reports, or preparing PDFs for printing and distribution. All numbering happens securely in your browser.',
    faqs: [
      { question: 'Can I use Roman numerals or letters instead of numbers?', answer: 'The tool currently supports Arabic numerals (1, 2, 3), page labels ("Page 1"), and total references ("1 of 10"). Custom formats require manual editing.' },
      { question: 'What if I only want to number some pages, not all?', answer: 'The tool numbers all pages (or all except the first if skipped). For selective numbering, use the Extract Pages tool to separate sections, number them individually, then merge back together.' },
      { question: 'Can I change page numbers after adding them?', answer: 'Page numbers are embedded into the PDF. To change them, use Start Over and reprocess with different settings, or manually edit with a PDF editor.' },
      { question: 'Is the font always Helvetica?', answer: 'Yes, we use Helvetica for reliable, clean appearance across all PDF readers. Custom fonts would add significant complexity.' },
      { question: 'What if the page numbers overlap with content?', answer: 'Choose a different position or reduce font size. Bottom positions are usually safest for standard documents.' }
    ]
  },
  {
    slug: 'insert-page-numbers-into-pdf-online',
    title: 'Insert page numbers into PDF online',
    description: 'Insert professional page numbers into any PDF document online.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Insert page numbers into your PDF document with complete control over placement and formatting. Our tool offers six positioning options to match your document layout, three number formats to suit different styles, and adjustable font sizing from 8pt to 24pt. Start numbering from any page number, perfect for multi-volume sets or appended documents. Skip the first page with a single checkbox for documents with title or cover pages. Unlike complex desktop software, our online tool requires no installation and processes your PDF securely in your browser. The result is ready to download, print, or share immediately.',
    faqs: [
      { question: 'How accurate is the page numbering?', answer: 'The tool counts and numbers each page sequentially from the one you specify. Every page receives the correct number based on your format choice.' },
      { question: 'Does adding page numbers change the file size much?', answer: 'Adding text increases the file size minimally—usually by 1-5% depending on font size and text length. The increase is negligible for most documents.' },
      { question: 'Can I preview the page numbers before finalizing?', answer: 'The tool shows your numbering settings before processing. The final PDF is generated and ready to download after you click "Add Page Numbers."' },
      { question: 'What happens if my PDF has different page sizes?', answer: 'Page numbers are positioned relative to each page\'s dimensions, so they align correctly even if pages have different sizes.' }
    ]
  },

  // --- PDF TOOLS: ADD WATERMARK ---
  {
    slug: 'add-watermark-to-pdf',
    title: 'Add watermark to PDF',
    description: 'Add text or image watermarks to your PDF with customizable positioning and opacity.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Add professional watermarks to your PDF documents with complete customization. Choose between text watermarks (fully customizable font, size, color, rotation, and opacity) or image watermarks (upload your logo or image). Position watermarks in six locations (center, corners, or tiled across the page), and apply to all pages or a specific range. Text watermarks are perfect for marking documents as "CONFIDENTIAL", "DRAFT", or "SAMPLE", while image watermarks are ideal for adding company logos or branding. All watermarking happens securely in your browser without uploading to any server. The result is ready to download immediately.',
    faqs: [
      { question: 'Can I use a semi-transparent watermark?', answer: 'Yes, both text and image watermarks support opacity control from 10% to 100%, allowing you to create subtle, semi-transparent watermarks that don\'t obscure the document.' },
      { question: 'Can I apply the watermark to only some pages?', answer: 'Yes, choose "Specific pages" and enter a range like "1-5" or individual pages like "1,3,5" to apply the watermark to only those pages.' },
      { question: 'What image formats are supported for image watermarks?', answer: 'PNG and JPG formats are supported. For best results, use a high-resolution image or logo, though the tool automatically scales it appropriately.' },
      { question: 'Can I rotate a text watermark diagonally?', answer: 'Yes, the rotation slider lets you rotate text from 0° to 360°, making it easy to create classic diagonal watermarks like 45°.' },
      { question: 'Does adding a watermark increase the file size significantly?', answer: 'Watermarks add minimal file size—usually 1-2% for text watermarks and 2-5% for image watermarks, depending on the image complexity.' }
    ]
  },
  {
    slug: 'add-text-watermark-to-pdf-online',
    title: 'Add text watermark to PDF online',
    description: 'Add customizable text watermarks to your PDF document.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Add text watermarks to your PDF with full control over appearance and placement. Type your watermark text (e.g., "CONFIDENTIAL", "DRAFT", "SAMPLE"), choose your font size, color, rotation angle, and opacity level. Select from six positioning options or use tiling to repeat the watermark in a grid pattern. Perfect for marking documents as confidential, draft, or for review. Apply the watermark to all pages or select a specific page range. The tool preserves all original PDF content while adding a professional-looking watermark. Everything runs in your browser for complete privacy and security.',
    faqs: [
      { question: 'What text should I use for my watermark?', answer: 'Common options include "CONFIDENTIAL", "DRAFT", "SAMPLE", "COPY", or "FOR REVIEW". Use any text you prefer—the tool has no restrictions.' },
      { question: 'What happens if my watermark text is very long?', answer: 'Longer text will take up more space on the page. Adjust the font size slider to find a size that fits well without obscuring document content.' },
      { question: 'Can I change the watermark text color?', answer: 'Yes, the color picker lets you choose any color. Black is the default, but you can select any color that matches your branding or preference.' },
      { question: 'What does the tiled position do?', answer: 'Tiled creates a 3x3 grid of your watermark text across the page, repeating the text in a diagonal pattern—a classic watermark effect.' }
    ]
  },
  {
    slug: 'add-logo-image-watermark-to-pdf',
    title: 'Add logo/image watermark to PDF',
    description: 'Add your company logo or image as a watermark to PDF pages.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Add your company logo, image, or any picture as a watermark to your PDF documents. Upload a PNG or JPG image and position it anywhere on the page—center, corners, or tiled in a grid. Adjust the image scale from 25% to 200% to fit your needs, and control the opacity for a subtle or prominent watermark. Apply to all pages or select specific pages using page ranges. Image watermarks are perfect for branding documents with your company logo without modifying the original PDF content. All image processing happens securely in your browser.',
    faqs: [
      { question: 'What image formats can I use for watermarks?', answer: 'PNG and JPG formats are supported. PNG is ideal for logos with transparent backgrounds, while JPG works well for photographs and complex images.' },
      { question: 'How large should my watermark image be?', answer: 'Any size works—the tool automatically scales it. For best results, use a high-resolution image (at least 500x500 pixels) if you plan to use it across multiple pages.' },
      { question: 'Can I make the image watermark very faint?', answer: 'Yes, the opacity slider lets you adjust from 10% (very faint) to 100% (fully opaque), giving you complete control over visibility.' },
      { question: 'Can I use a watermark image multiple times on one page?', answer: 'Use the tiled position to repeat your image in a 3x3 grid pattern across the page.' }
    ]
  },

  // --- PDF TOOLS: ORGANIZE PDF ---
  {
    slug: 'organize-pdf-pages-online',
    title: 'Organize PDF pages online',
    description: 'Reorder and delete PDF pages with an easy-to-use online tool.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Organize your PDF by reordering pages, removing unwanted pages, or both. Upload your PDF and see all pages listed in order. Use up/down arrow buttons to reorder pages, or click the delete button (✕) to remove pages you don\'t need. The tool shows you exactly how many pages will remain before you save. Perfect for reorganizing scanned documents, removing blank pages, rearranging sections, or preparing PDFs for sharing. All changes happen in your browser—your original PDF is never uploaded to any server. The organized PDF is ready to download immediately.',
    faqs: [
      { question: 'Can I restore a deleted page?', answer: 'Yes, click the ↩ button on any deleted page to restore it. Your changes are not final until you click "Save Changes".' },
      { question: 'What if I delete the wrong page?', answer: 'As long as you haven\'t clicked "Save Changes" yet, you can restore it by clicking the ↩ button on that page.' },
      { question: 'Can I move a page to a completely different position?', answer: 'Use the up/down arrow buttons to move pages one position at a time. The tool preserves your page order as you move them.' },
      { question: 'Is there a limit to how many pages I can organize?', answer: 'You can organize PDFs up to 50 MB. Larger files may process more slowly when saving changes.' },
      { question: 'Can I organize pages without deleting any?', answer: 'Yes, you can use the tool just to reorder pages without deleting any. Simply use the up/down arrows and click "Save Changes" when done.' }
    ]
  },
  {
    slug: 'reorder-and-delete-pdf-pages',
    title: 'Reorder and delete PDF pages',
    description: 'Easily reorder, delete, and reorganize pages in your PDF document.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Take full control of your PDF by reordering pages and removing unwanted content in one place. Upload your PDF and interact with a simple list showing all pages in order. Each page displays its number and position, with intuitive controls: up/down arrows for reordering and a delete button for removal. Real-time feedback shows how many pages remain after deletions. Combine reordering and deletion to create the perfect document structure. Whether you\'re preparing a presentation, removing blank pages from a scan, or reorganizing sections, this tool makes it simple. All processing happens securely in your browser.',
    faqs: [
      { question: 'Can I reorder and delete pages in the same session?', answer: 'Absolutely. You can reorder pages, delete pages, or do both in any combination. The tool shows a preview of your changes before you finalize.' },
      { question: 'How do I move a page far up or down?', answer: 'Use the up/down arrow buttons repeatedly to move it position by position. Click "Save Changes" when the order looks right.' },
      { question: 'What if I accidentally delete a page?', answer: 'Before saving, click the ↩ button on the deleted page to restore it. Once you click "Save Changes", the operation is final.' },
      { question: 'Will the file size change after reordering?', answer: 'Usually minimal—reordering doesn\'t significantly change file size. Deleting pages will reduce the file size proportionally.' }
    ]
  },

  // --- PDF TOOLS: CROP PDF ---
  {
    slug: 'crop-pdf-pages-online',
    title: 'Crop PDF pages online',
    description: 'Remove margins and crop PDF pages with adjustable crop settings.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Crop unwanted margins from your PDF pages using simple numeric inputs. Specify margins in millimeters or percentage for top, bottom, left, and right edges. Apply the same crop to all pages or select specific pages using page ranges. Our tool uses the standard PDF crop box feature, which changes what viewers display without removing content from the file—most modern PDF readers show the cropped result correctly. Perfect for removing scanned document borders, adjusting page layouts, or preparing PDFs for printing with custom margins. All cropping happens securely in your browser.',
    faqs: [
      { question: 'What\'s the difference between mm and percentage?', answer: 'Millimeters (mm) removes a fixed distance from each edge. Percentage removes that portion of the page width/height, so the same percentage works across pages of different sizes.' },
      { question: 'Will the cropped content be deleted?', answer: 'No, the crop uses the PDF crop box feature. Content outside the crop area is hidden but not removed. Some older PDF viewers may display the uncropped version.' },
      { question: 'Can I crop different amounts on different pages?', answer: 'The tool applies the same crop to all selected pages. For page-specific cropping, process the PDF multiple times with different page ranges.' },
      { question: 'What if my crop is too large?', answer: 'The tool will show an error if the crop margins are so large that nothing remains. Adjust the margins and try again.' },
      { question: 'Do the cropped pages change file size?', answer: 'Minimal change—cropping affects only the visible area, not the underlying content. File size reduction is usually negligible.' }
    ]
  },
  {
    slug: 'remove-margins-from-pdf',
    title: 'Remove margins from PDF',
    description: 'Easily remove margins and empty space from PDF pages online.',
    type: 'compressor',
    category: 'pdf',
    guideText: 'Remove white space and margins from your PDF pages with precise control. Use intuitive numeric inputs to specify how much margin to remove from each edge in millimeters or percentage. See a live preview of your crop settings before applying. Apply to all pages or target specific pages using page ranges. Ideal for cleaning up scanned documents with large white borders, optimizing pages for mobile viewing, or preparing PDFs for web publishing. The tool uses the standard PDF crop box approach—content remains in the file but is hidden from view by most PDF readers.',
    faqs: [
      { question: 'How do I remove all margins equally?', answer: 'Set the same value for all four margins (top, bottom, left, right). For example, enter 10mm for all sides to remove 10mm from each edge.' },
      { question: 'Can I remove margins from just the first page?', answer: 'Yes, choose "Specific pages" and enter "1" to crop only the first page. Apply different crops by processing the PDF multiple times.' },
      { question: 'What happens if I remove margins from a page with content near the edges?', answer: 'The crop box hides anything in the crop area. If important content is in the margins you\'re removing, adjust the margin amounts accordingly.' },
      { question: 'Are margins always white space?', answer: 'Not necessarily. The tool crops a fixed distance from page edges regardless of content. Review your settings carefully before saving.' }
    ]
  }
];

export const categoryInfo: { [key: string]: { label: string; description: string; icon: string } } = {
  photo: {
    label: 'Photo Tools',
    description: 'Compress and resize photos, ID pictures, and passport photos with precision.',
    icon: '📷'
  },
  signature: {
    label: 'Signature Tools',
    description: 'Resize and optimize your signature for exams, forms, and official documents.',
    icon: '✍️'
  },
  pdf: {
    label: 'PDF Tools',
    description: 'Convert and merge images into PDF documents with professional layout options.',
    icon: '📄'
  }
};
