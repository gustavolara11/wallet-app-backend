const express = require("express");
const router = express.Router();
const db = require("../db");

const findOne = (id) => {
  return (query = {
    name: "fetch-category",
    text: "SELECT * FROM categories WHERE id = $1",
    values: [Number(id)],
  });
};

router.get("/", (req, res) => {
  db.query("SELECT * FROM categories", (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(response.rows);
  });
});

router.post("/", (req, res) => {
  const { name } = req.body;

  if (name.length < 3) {
    return res
      .status(400)
      .json({ error: "Name should have more than 3 caracters." });
  }

  const text = "INSERT INTO categories(name) VALUES($1) RETURNING *";
  const value = [name];

  db.query(text, value, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(response.rows);
  });
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Id param is mandatory" });
    }
    const query = findOne(id);
    const category = await db.query(query);

    if (!category.rows[0]) {
      return res.status(404).json({ error: "Category not found." });
    }

    const text = "DELETE FROM categories WHERE id=$1 RETURNING *";
    const value = [Number(id)];
    const deleteResponse = await db.query(text, value);
    if (!category.rows[0]) {
      return res.status(400).json({ error: "Category not deleted." });
    }
    return res.status(200).json(deleteResponse.rows);
  } catch (error) {
    return res.status(500).json(error);
  }
});
module.exports = router;
