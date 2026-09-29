export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => [...document.querySelectorAll(selector)];

export const dom = {
  app: $('#app'),
  title: $('#title'),
  modal: $('#modal'),
  toast: $('#toast'),
  add: $('#add'),
  nav: $('nav')
};
