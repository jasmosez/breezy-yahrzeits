import { UserInterface } from '../lib/UserInterface.js';
import { HDate } from '@hebcal/core';
import { config } from '../config.js';
import assert from 'assert'
import sinon from 'sinon'


describe('UserInterface', () => {
    let ui;

    beforeEach(() => {
        ui = new UserInterface();
    });

    describe('determineTargetYear', () => {
        before(() => {
          const now = new Date(2024, 1, 25);
          sinon.useFakeTimers(now.getTime());
        });
    
        after(() => {
            sinon.restore()
        })
        it('returns the current year if the selected month is in the future', () => {
          const monthFilter = 3;
          const today = new Date();
          const expectedYear = today.getFullYear();
          const result = ui.determineTargetYear(monthFilter);
          assert.equal(result, expectedYear);
        });
        
        it('returns the current year if the selected month is the current month', () => {
          const monthFilter = 2;
          const today = new Date();
          const expectedYear = today.getFullYear();
          const result = ui.determineTargetYear(monthFilter);
          assert.equal(result, expectedYear);
        });
    
        it('returns the next year if the selected month has passed', () => {
          const monthFilter = 1;
          const today = new Date();
          const expectedYear = today.getFullYear() + 1;
          const result = ui.determineTargetYear(monthFilter);
          assert.equal(result, expectedYear);
        });
      });
    

});
