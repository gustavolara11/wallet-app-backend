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
  db.query("SELECT * FROM categories ORDER BY name ASC", (error, response) => {
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
    if (!deleteResponse.rows[0]) {
      return res.status(400).json({ error: "Category not deleted." });
    }
    return res.status(200).json(deleteResponse.rows[0]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Id param is mandatory" });
    }
    if (name.length < 3) {
      return res
        .status(400)
        .json({ error: "Name should have more than 3 caracters." });
    }
    const query = findOne(id);
    const category = await db.query(query);
    if (!category.rows[0]) {
      return res.status(404).json({ error: "Category not found." });
    }

    const text = "UPDATE categories SET name=$1 WHERE id=$2 RETURNING * ";
    const value = [name, Number(id)];

    const updateResponse = await db.query(text, value);
    if (!updateResponse.rows[0]) {
      return res.status(400).json({ error: "Category not updated." });
    }
    return res.status(200).json(updateResponse.rows[0]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
