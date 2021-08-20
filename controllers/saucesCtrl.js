const express = require('express');

const { isEmpty } = require('lodash');

const router = express.Router();
const config = require('../config');
const Sauce = require('../schema/Sauce');
const Tools = require('../tools');


class SaucesController {
  async getAllSauces(req, res, next) {
    const sauces = await Sauce.find();
    res.json(sauces);
  }

  async getOneSauce(req, res, next) {
    const { id } = req.params;
    const sauce = await Sauce.findOne({ _id: id });
    res.json(sauce);
  }

  async createSauce(req, res, next) {
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
  }

  async updateSauce(req, res, next) {
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
  }

  async deleteSauce(req, res, next) {
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
  }

  async likes(req, res, next) {
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
  }
}

module.exports = SaucesController;
