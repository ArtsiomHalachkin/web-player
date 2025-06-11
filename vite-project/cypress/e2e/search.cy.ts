/// <reference types="cypress" />

describe('Music Searcher App', () => {
  beforeEach(() => {
     cy.auth(); 
  });


  it('should display search results with given name', () => {
    cy.visit('/home');
    cy.get('.search-input').type('Imagine Dragons{enter}');
    cy.get('#search-results').should('be.visible');
    cy.get('#search-results').contains('Imagine Dragons').should('exist');
  }
  );

  it('should display the user profile', () => {
    cy.visit('/home');
     cy.visit('/library');
    cy.get('.creator').first().click();
    cy.url().should('include', '/artist/');

    cy.get('#artist-detail').should('be.visible')
  });
  
  it('unlike ', () => {
  cy.visit('/home');
  cy.visit('/library');
  const firstTrack = cy.get('#track-card').first();

    cy.get('#like-btn').first().click();
  firstTrack.invoke('text').then((trackText) => {
    cy.get('#likes-view').should('not.contain', trackText.trim());
  })
})

  it('should display the liked track', () => {
    cy.visit('/home');
    const firstTrack = cy.get('#track-card').first();

    cy.get('#like-btn').first().click();
    cy.visit('/library');

     firstTrack.invoke('text').then((trackText) => {
       cy.get('#likes-view').should('contain', trackText.trim());
     });
  });




});