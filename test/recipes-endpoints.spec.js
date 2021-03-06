const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeRecipesArray } = require('./recipes.fixture');

describe('Recipes Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  });

  after('disconnect from db', () => db.destroy())
  before('clean the table', () => db.raw('TRUNCATE recipes RESTART IDENTITY CASCADE'));
  afterEach('cleanup',() => db.raw('TRUNCATE recipes RESTART IDENTITY CASCADE'));
 
  
  //==================================
  // GET recipes
  //==================================

  describe(`GET /api/recipes`, () => {
    context(`Given no recipes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/recipes')
          .expect(200, [])
      })
    });

    context('Given there are recipes in the database', () => {
      const testRecipes = makeRecipesArray();

      beforeEach('insert recipe', () => {
        return db 
          .into('recipes')
          .insert(testRecipes)
      })

      it('responds with 200 and all of the recipes', () => {
        return supertest(app)
          .get('/api/recipes')
          .expect(200, testRecipes)
      })
    });

  });
  //==================================
  // GET recipes with id
  //==================================

  describe(`GET /api/recipes/:id`, () => {
    context(`Given no recipes`, () => {
      it(`responds with 404`, () => {
        const recipesId = 123456

        return supertest(app)
          .get(`/api/recipes/${recipesId}`)
          .expect(404, { error: { 
            message: `The recipe doesn't exist` }
          })
      })
    });

    // recipes in the database
    context('Given there are recipes in the database', () => {
      const testRecipes = makeRecipesArray();

      beforeEach('insert recipes', () => {
        return db 
          .into('recipes')
          .insert(testRecipes)
      })

      it('responds with 200 and the specified recipe', () => {
        const recipeId = 2
        const expectedRecipe = testRecipes[recipeId - 1]
        return supertest(app)
          .get(`/api/recipes/${recipeId}`)
          .expect(200, expectedRecipe)
      });
    });
  });
   //==================================
  // POST recipes
  //==================================

  describe(`POST /api/recipes`, () => {
    const testRecipes = makeRecipesArray();

    beforeEach('insert recipes', () => {
      return db 
        .into('recipes')
        .insert(testRecipes)
    })

    it.skip('responds with 201 and the recipe', () => {
      const newRecipe = {
        name: 'New Recipe name',
        directions: 'Test new directions',
        ingredients: 'Test new ingredients',
        main_protein: 'Test new main_protein',
        calories: 'Test new calories',
        protein: 'Test new protein',
      }
      return supertest(app)
        .post('/api/recipes')
        .send(newRecipe)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.name).to.eql(newRecipe.name)
          expect(res.body.directions).to.eql(newRecipe.directions)
          expect(res.body.ingredients).to.eql(newRecipe.ingredients)
          expect(res.body.main_protein).to.eql(newRecipe.main_protein)
          expect(res.body.calories).to.eql(newRecipe.calories)
          expect(res.body.protein).to.eql(newRecipe.protein)
        })
    })
  });

  //==================================
  // DELETE recipes
  //==================================

  describe(`DELETE /api/recipes/:id`, () => {
    const testRecipes = makeRecipesArray();

    beforeEach('insert recipe', () => {
      return db
        .into('recipes')
        .insert(testRecipes)
    })
    
    it('responds with 200 and removes the recipe', () => {
      const idToRemove = 2;
      const testRecipes = makeRecipesArray();
      const expectedRecipe = testRecipes.filter(recipe => recipe.id !== idToRemove);
      return supertest(app)
        .delete(`/api/recipes/${idToRemove}`)
        .expect(200)
        .then(res => {
          supertest(app)
            .get(`/api/recipes`)
            .expect(expectedRecipe)
        })
    });
  });
  
  
});//end of all



