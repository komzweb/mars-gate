// @vitest-environment jsdom
import React from 'react';
import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,act,cleanup} from '@testing-library/react';
import App from './App.jsx';
import {getCase} from './lib/benchmark.js';

beforeEach(()=>{vi.useFakeTimers();Element.prototype.scrollIntoView=vi.fn();window.matchMedia=vi.fn().mockReturnValue({matches:false})});
afterEach(()=>{cleanup();vi.useRealTimers()});
function inspect(){fireEvent.click(screen.getByRole('button',{name:/start inspection/i}));act(()=>vi.advanceTimersByTime(1500));}

describe('MARS GATE inspection UI',()=>{
 it('keeps the visitor image in sync with filters, navigation, and replay',()=>{
  render(<App/>);
  const selectedCase=()=>screen.getByRole('combobox',{name:'Select case'}).value;
  const portrait=()=>screen.getByRole('img',{name:/visitor portrait inside the entry scanner/i});
  const image=()=>portrait().querySelector('img');
  const expectCurrentImage=()=>{
   const type=getCase(selectedCase()).observable.profile.type;
   expect(portrait().getAttribute('aria-label')).toContain(type);
   expect(image().getAttribute('src')).toMatch(new RegExp(`${type.toLowerCase()}\\.png`));
  };
  expectCurrentImage();
  fireEvent.click(screen.getByRole('button',{name:'Next case'}));expectCurrentImage();
  fireEvent.click(screen.getByRole('button',{name:'Previous case'}));expectCurrentImage();
  const beforeRandom=selectedCase();
  fireEvent.click(screen.getByRole('button',{name:'Random case'}));
  expect(selectedCase()).not.toBe(beforeRandom);expectCurrentImage();
  for(const type of ['Human','Android','Alien','Cyborg','Synthetic','Uplift']){
   fireEvent.change(screen.getByRole('combobox',{name:'Filter cases by visitor type'}),{target:{value:type}});
   expect(getCase(selectedCase()).observable.profile.type).toBe(type);
   expectCurrentImage();
  }
  fireEvent.click(screen.getByRole('button',{name:/start inspection/i}));
  expect(portrait().className).toContain('portrait-active');
  act(()=>vi.advanceTimersByTime(1500));
  fireEvent.click(screen.getByRole('button',{name:/replay inspection/i}));
  expect(portrait().className).toContain('portrait-active');
  act(()=>vi.advanceTimersByTime(1500));
  expect(screen.getByText('ROUTE ACTIVE')).toBeTruthy();
 });
 it('renders frozen Final Action and route after inspection',()=>{
  render(<App/>);expect(screen.getByText('ENTRY GATE / A-17')).toBeTruthy();
  inspect();
  expect(screen.getByText('ROUTE ACTIVE')).toBeTruthy();
  expect(screen.getByText('INSPECTION BAY')).toBeTruthy();
  expect(screen.getByText(/I1: unresolved physical concern/)).toBeTruthy();
  expect(screen.getByText('RULE I1')).toBeTruthy();
  expect(screen.getByText('↳ ROUTE TRIGGER')).toBeTruthy();
  expect(screen.getByRole('button',{name:/view decision trace/i})).toBeTruthy();
 });
 it('switches models, cases, and comparison without changing frozen outcomes',()=>{
  const {container}=render(<App/>);inspect();
  expect(container.querySelector('.trace-kicker')?.textContent).toContain('DECISION TRACE · JEV');
  fireEvent.click(screen.getByRole('button',{name:'GPT-5.6 LUNA'}));
  expect(screen.getAllByText('DENY').length).toBeGreaterThan(0);
  expect(container.querySelector('.trace-kicker')?.textContent).toContain('DECISION TRACE · GPT-5.6 LUNA');
  fireEvent.click(screen.getByRole('button',{name:/compare mode/i}));
  expect(screen.getByText('3-MODEL COMPARISON')).toBeTruthy();
  expect(screen.getAllByText('ROUTE DECISION').length).toBe(3);
  expect(screen.getByText('MODEL COMPARISON SUMMARY')).toBeTruthy();
  expect(screen.getAllByText('≠ MODEL DISAGREEMENT').length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button',{name:'View GPT-6 LUNA decision trace'}));
  expect(container.querySelector('.trace-kicker')?.textContent).toContain('DECISION TRACE · GPT-6 LUNA');
  fireEvent.click(screen.getByRole('button',{name:/next case/i}));
  expect(screen.getAllByText(/HB-002/).length).toBeGreaterThan(0);
  expect(screen.queryByText('3-MODEL COMPARISON')).toBeNull();
 });
 it('keeps Ground Truth hidden until reveal and loads research publication metrics',()=>{
  render(<App/>);
  expect(screen.queryByText('ATOMIC MATCH 7 / 8')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:/reveal ground truth/i}));
  expect(screen.getByText('ATOMIC MATCH 7 / 8')).toBeTruthy();
  expect(screen.getByText('Final Action matched. 7 of 8 atomic judgments matched Frozen Gold.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'RESEARCH RESULTS'}));
  expect(screen.getByText('What did the terminal find?')).toBeTruthy();
  expect(screen.getByText('119/120')).toBeTruthy();
  expect(screen.getByText('109/120')).toBeTruthy();
  expect(screen.getByText('120/120')).toBeTruthy();
  expect(screen.getByText(/4 sensitivity variants were missed/)).toBeTruthy();
  expect(screen.getByText('HEADLINE FINDINGS')).toBeTruthy();
 });
 it('moves focus to the decision after a completed sequence and supports manual return',()=>{
  render(<App/>);inspect();act(()=>vi.advanceTimersByTime(30));
  expect(document.activeElement?.textContent).toBe('AI Decision System');
  expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:/view decision trace/i}));
  expect(document.activeElement?.textContent).toBe('AI Decision System');
 });
});
