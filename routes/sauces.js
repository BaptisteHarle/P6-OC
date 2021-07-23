const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const { isEmpty } = require('lodash');

const router = express.Router();
const config = require('../config');
const Sauce = require('../schema/Sauce');
const Tools = require('../tools');
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
    cb(null, 'images/');
  },
  filename(req, file, cb) {
    const id = uuidv4();
    const extension = file.mimetype.split('/')[1];
    req.fileSaved = {
      id,
      extension,
      imageUrl: `http://localhost:3000/images/${id}.${extension}`,
    };
    cb(null, `${id}.${extension}`);
  },
});
/**
 * Ici on vérifie l'extension du fichier
 * Si l'extension n'est pas l'extension d'une image, alors on renvoie toujours un message
 * conformément aux attentes de la documentation mais indiquant que seules les images
 * sont autorisées.
 */
const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const { mimetype } = file;
    if (!config.files.validExtensions.includes(mimetype)) {
      return cb(JSON.stringify({ message: 'Seules les images sont autorisées.' }), false);
    }
    cb(null, true);
  },
});
/**
 * Point d'API GET
 * Renvoie toutes les sauces présentes dans la BDD
 */
router.get('/sauces', Tools.authenticateToken, async (req, res) => {
  const sauces = await Sauce.find();
  res.json(sauces);
});
/**
 * Dans un try...catch
 * Ici, on sait que le problème du fichier a déjà été traité par Multer en amont
 * On a donc plus qu'à récupérer les infos de la sauce
 * Puis à créer la sauce et à la sauvegarder
 *
 * Si tout s'est bien passé, alors on renvoie un message.
 * Sinon, on renvoie l'erreur à sec, comme demandé dans la note de cadrage
 */
router.post('/sauces', Tools.authenticateToken, upload.single('image'), async (req, res) => {
  // Ici, on check si on a recu une image
  if (!req.fileSaved) {
    res.status(500).json({ message: 'Merci de renseigner une image.' });
  } else {
    try {
      const { sauce: jsonSauce } = req.body;
      const sauceData = JSON.parse(jsonSauce);
      const sauce = new Sauce({
        ...sauceData,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        imageUrl: req.fileSaved.imageUrl,
      });
      await sauce.save();
      res.json({ message: `La sauce '${sauceData.name}' a bien été créée.` });
    } catch (error) {
      res.json(error);
    }
  }
});
router.put('/sauces/:id', Tools.authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const sauce = await Sauce.findOne({ _id: id });

    if (sauce) {
      if (req.fileSaved) {
        const sauceData = req.body.sauce ? {
          ...JSON.parse(req.body.sauce),
          imageUrl: req.fileSaved.imageUrl,
        } : {
          imageUrl: req.fileSaved.imageUrl,
        };
        await Sauce.findOneAndUpdate({ _id: id }, sauceData);
        res.json({ message: `les informations de la sauce ${sauce.name} ont bien était modifiés` });
      } else if (req.body && !isEmpty(req.body)) {
        await Sauce.findOneAndUpdate({ _id: id }, req.body);
        res.json({ message: `les informations de la sauce ${sauce.name} ont bien était modifiés` });
      } else {
        res.json({ message: 'Aucune information' });
      }
    } else {
      res.json({ message: 'aucune sauce trouvé' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
router.post('/sauces/:id/like', Tools.authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const sauce = await Sauce.findOne({ _id: id });
    const { userId, like } = req.body;
    if (like === 1) { // le user a liké
      if (!sauce.usersLiked.includes(userId)) { // Le user n'as pas liké auparavant
        // faire le like
        sauce.usersLiked.push(userId);
        sauce.likes += 1; // on reprend le nombre de like et on lui ajoute +1
        if (sauce.usersDisliked.includes(userId)) {
          sauce.dislikes -= 1;
          const index = sauce.usersDisliked.indexOf(userId);
          sauce.usersDisliked.splice(index, 1);
        }
        await sauce.save();
        res.json({ message: `vous avez like la sauce ${sauce.name}` });
      } else {
        res.json({ message: 'vous avez deja liké cette sauce' });
      }
    } else if (like === 0) { // le user a remet ses likes a 0
      if (sauce.usersLiked.includes(userId)) { // le user avais like
        sauce.likes -= 1;
        const index = sauce.usersLiked.indexOf(userId);
        sauce.usersLiked.splice(index, 1);
        await sauce.save();
        res.json({ message: `vous avez enlevé votre like sur la ${sauce.name}` });
      } else if (sauce.usersDisliked.includes(userId)) { // le user a dislike
        sauce.dislikes -= 1;
        const index = sauce.usersDisliked.indexOf(userId);
        sauce.usersDisliked.splice(index, 1);
        await sauce.save();
        res.json({ message: `vous avez enlevé votre dislike sur la ${sauce.name}` });
      } else {
        res.status(403).json({ message: 'bien essayé' });
      }
    } else if (like === -1) { // le user a dislike
      if (!sauce.usersDisliked.includes(userId)) {
        sauce.usersDisliked.push(userId);
        sauce.dislikes += 1; // on reprend le nombre de dislike et on lui ajoute +1
        if (sauce.usersLiked.includes(userId)) {
          sauce.likes -= 1;
          const index = sauce.usersLiked.indexOf(userId);
          sauce.usersLiked.splice(index, 1);
        }
        await sauce.save();
        res.json({ message: `vous avez dislike la sauce ${sauce.name}` });
      } else {
        res.json({ message: 'vous avez deja dislike cette sauce' });
      }
    } else {
      res.status(403).json({ message: 'petit malin cela ne marche' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete('/sauces/:id', Tools.authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const sauce = await Sauce.findOne({ _id: id });
    if (sauce) {
      await Sauce.deleteOne({ _id: id });
      res.json({ message: `La sauce ${sauce.name} a bien était supprimé` });
    } else {
      res.json({ message: 'Cette sauce n\'existe pas' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
/**
 * Point d'API GET
 * Renvoie la sauce ayant l'id passé en paramétre de route
 */
router.get('/sauces/:id', Tools.authenticateToken, async (req, res) => {
  const { id } = req.params;
  const sauce = await Sauce.findOne({ _id: id });
  res.json(sauce);
});
module.exports = router;
