/// <reference types="cypress" />

;

Cypress.Commands.add('auth', () => {  
  
cy.getCookie('spotify_access_token').then(cookie => {
  const token = "your_spotify_access_token"; // Replace with your actual token, do not commit this in production code
  cy.setCookie('spotify_access_token', token);
  cy.window().then((win) => {
    win.localStorage.setItem('spotify_access_token', token);
  });
});
  
});

export {}
declare global {
    namespace Cypress {
        interface Chainable {
            auth(): Chainable<void>;
        }
    }
}

export {};

