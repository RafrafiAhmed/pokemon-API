const express = require("express");

const axios = require("axios");

const url =
  "https://raw.githubusercontent.com/Biuni/PokemonGO-Pokedex/master/pokedex.json";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//  Get all names/ Get image type spawn_chance.
app.get("/", async (req, res) => {
  try {
    const { data } = await axios.get(url);

    if (req.query.pokemonName) {
      pokemonQuery = data.pokemon.map((element) => {
        return {
          image: element.img,
          type: element.type,
          spawn_chance: element.spawn_chance,
        };
      });
      return res.send(pokemonQuery);
    } else {
      pokemonNames = data.pokemon.map((element) => {
        return element.name;
      });
      res.send(pokemonNames);
    }
  } catch (e) {
    console.log(e);
    res.send(500).send("error");
  }
});

//[GET] /weak/?typeName -> returns all pokemons that are week to those element type
app.get("/weak/", async (req, res) => {
  try {
    const typeName = req.query.typeName;
    const { data } = await axios.get(url);

    const counterList = data.pokemon
      .filter((pokemon) => {
        return pokemon.weaknesses.includes(typeName);
      })
      .map((pokemon) => pokemon.name);

    return res.send(counterList);
  } catch (e) {
    console.log(e);
    return res.sendStatus(500).send("error");
  }
});

//[GET] /strong/?typeName -> returns all pokemons that are strong to those element type

app.get("/strong/", async (req, res) => {
  try {
    const typeName = req.query.typeName;
    const { data } = await axios.get(url);

    const counterList = data.pokemon
      .filter((pokemon) => {
        return !pokemon.weaknesses.includes(typeName);
      })
      .map((pokemon) => pokemon.name);

    return res.send(counterList);
  } catch (e) {
    console.log(e);
    return res.sendStatus(500).send("error");
  }
});

//[POST] /figth/ BODY:{myPokemon:string, enemyPokemon:string} -> returns win / draw / lose

app.post("/fight", async (req, res) => {
  const { myPokemon, enemyPokemon } = req.body;

  try {
    const { data } = await axios.get(url);
    const myPokemonData = data.pokemon.find(
      (pokemon) => pokemon.name == myPokemon
    );
    const enemyPokemonData = data.pokemon.find(
      (pokemon) => pokemon.name == enemyPokemon
    );
    console.log(myPokemonData);
    let counter = false;
    for (let type of myPokemonData.type) {
      if (enemyPokemonData.weaknesses.includes(type)) counter = true;
    }
    if (counter)
      return res.send({
        myPokemon,
        enemyPokemon,
        result: `${myPokemon} win the fight!`,
      });

    for (let type of enemyPokemonData.type) {
      if (myPokemonData.weaknesses.includes(type)) counter = true;
    }
    if (counter)
      return res.send({
        myPokemon,
        enemyPokemon,
        result: `${enemyPokemon} win the fight!`,
      });

    return res.send({ myPokemon, enemyPokemon, result: "draw" });
  } catch (error) {
    return res.send(error);
  }
});

app.listen(3000, () => {
  console.log("server is connected!");
});
