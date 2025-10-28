import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, } from 'pdf-lib';
import { fileURLToPath } from 'url';
import DocumentModel from '../models/Document.js';
import SignatureModel from '../models/Signature.js';
import { createRequire } from 'module';


const require = createRequire(import.meta.url);
const fontkit = require('@pdf-lib/fontkit');




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const applySignature = async (req, res) => {
    console.log('👉 applySignature called');
  try {
    
    const { documentId } = req.params;

    const document = await DocumentModel.findById(documentId);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const signature = await SignatureModel.findOne({ documentId });
    console.log('📄 Signature fetched from DB:', signature);
    if (!signature) return res.status(404).json({ message: 'Signature not found' });

    const safePath = document.filePath.replace(/\\/g, '/'); // 🔁 Replace Windows slashes
    const filePath = path.join(__dirname, '..', safePath);

    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    pdfDoc.registerFontkit(fontkit);

    const fontMap = {
    'Pacifico': 'Pacifico-Regular.ttf',
    'Anton': 'Anton-Regular.ttf',
    'Caveat': 'Caveat-VariableFont_wght.ttf',
    'Comfortaa': 'Comfortaa-VariableFont_wght.ttf',
    'Dancing Script': 'DancingScript-VariableFont_wght.ttf',
    'Fira Sans': 'FiraSans-Regular.ttf',
    'Great Vibes': 'GreatVibes-Regular.ttf',
    'Indie Flower': 'IndieFlower-Regular.ttf',
    'Kalam': 'Kalam-Regular.ttf',
    'Lora': 'Lora-VariableFont_wght.ttf',
    'Nunito': 'Nunito-VariableFont_wght.ttf',
    'Orbitron': 'Orbitron-VariableFont_wght.ttf',
    'Playfair Display': 'PlayfairDisplay-VariableFont_wght.ttf',
    'Quicksand': 'Quicksand-VariableFont_wght.ttf',
    'Raleway': 'Raleway-VariableFont_wght.ttf',
    'Roboto': 'Roboto-VariableFont_wdth,wght.ttf',
    'Shadows Into Light': 'ShadowsIntoLight-Regular.ttf',
    'Signika': 'Signika-VariableFont_GRAD,wght.ttf',
    'Ubuntu': 'Ubuntu-Regular.ttf',
    'Zeyada': 'Zeyada-Regular.ttf',
    };



    const fontFile = fontMap[signature.font] || 'Roboto-VariableFont_wdth,wght.ttf'; // fallback
    const fontPath = path.join(__dirname, '..', 'fonts', fontFile);
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes, { subset: false });

    console.log(fontPath);    
        
    const pageIndex = Math.max(0, (signature.page || 1) - 1);
    const pages = pdfDoc.getPages();
    const page = pages[pageIndex];

    const width = page.getWidth();
    const height = page.getHeight();

    const fontSize  = signature.fontSize || 24;
    console.log('🔎 Coordinate transform debug:', {
    signatureX: signature.x,
    signatureY: signature.y,
    pageWidth: width,
    pageHeight: height,

    
    });

    if (signature.x == null || signature.y == null) {
    console.error('❌ Signature coordinates missing:', signature);
    return res.status(400).json({ error: 'Invalid signature coordinates' });
    }

    console.log('✅ Backend signature.x:', signature.x, 'signature.y:', signature.y);
    if (signature.x == null || signature.y == null) {
    return res.status(400).json({ error: 'Signature coordinates missing' });
    }

    const safeX = Math.max(0, signature.x);
    const safeY = Math.max(0, signature.y);

    const textWidth = customFont.widthOfTextAtSize(signature.name, fontSize);
    const centeredX = safeX - textWidth / 2;

    console.log('🖊️ Applying signature with fontSize:',  fontSize);

    console.log('🧾 Drawing signature:', {
    name: signature.name,
    x: signature.x,
    y: signature.y,
    fontSize,
    font: signature.font,
    });

    page.drawText(signature.name, {
        x: centeredX   ,
        y: safeY   ,
        size: fontSize,
        font:customFont,
        color: rgb(0, 0, 0),
    });
    console.log('📏 typeof fontSize:', typeof fontSize);

    const signedDir = path.join(__dirname, '..', 'uploads', 'signed');
        await fs.promises.mkdir(signedDir, { recursive: true });

        const signedPdfBytes = await pdfDoc.save();
        const signedFileName = `signed_${document.fileName}`;
        const signedPath = path.join(signedDir, signedFileName);
        await fs.promises.unlink(signedPath).catch(() => {});
        await fs.promises.writeFile(signedPath, signedPdfBytes);

        res.json({
        url: `/uploads/signed/${signedFileName}`,
        fileName: signedFileName
        });
    } catch (err) {
    console.error('❌ applySignature Error:', err);
    res.status(500).json({ error: 'Failed to apply signature to PDF' });
    }
}; 
  