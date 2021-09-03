const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const config = require('../config');

/**
 * Ici on configure le stockage de multer
 * On définit : le nom du fichier final et le lieu de sauvegarde
 * et on en profite pour attacher à l'objet requête global les nouvelles informations
 * pour que la route puisse sauvegarder en base notamment l'imageUrl
 *
 * Ps: Pour renommer, j'ai utlisé une librairie qui génère un uuid unique pour m'assurer que chacun
 * des fichiers aura bien un nom unique. Même si deux sauces devaient avoir la même
 * photo par exemple.
 */
 const storage = multer.diskStorage({
  destination(req, file, cb) {
    if(cb && typeof cb === 'function') cb(null, 'images/');
  },
  filename(req, file, cb) {
    const id = uuidv4();
    const extension = file.mimetype.split('/')[1];
    req.fileSaved = {
      id,
      extension,
      imageUrl: `http://localhost:3000/images/${id}.${extension}`,
    };
    if(cb && typeof cb === 'function') cb(null, `${id}.${extension}`);
  },
});
/**
 * Ici on vérifie l'extension du fichier
 * Si l'extension n'est pas l'extension d'une image, alors on renvoie toujours un message
 * conformément aux attentes de la documentation mais indiquant que seules les images
 * sont autorisées.
 */
const multerMiddleware = multer({
  storage,
  fileFilter(req, file, cb) {
    const { mimetype } = file;
    if (!config.files.validExtensions.includes(mimetype)) {
      return cb(JSON.stringify({ message: 'Seules les images sont autorisées.' }), false);
    }
    cb(null, true);
  },
});

module.exports = multerMiddleware;
