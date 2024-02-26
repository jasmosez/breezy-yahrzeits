import { YahrzeitCollection } from '../lib/YahrzeitCollection.js';
import { HDate } from '@hebcal/core';
import { config } from '../config.js';
import assert from 'assert'
import sinon from 'sinon'


describe('YahrzeitCollection', () => {
  let collection;

  beforeEach(() => {
    collection = new YahrzeitCollection();
  });

  describe('dateFromStr', () => {
    it('returns a Date object from "mm/dd/yyyy" format', () => {
      const dateStr = '04/19/1982';
      const expectedDate = new Date(1982, 3, 19);
      const result = collection.dateFromStr(dateStr);
      assert.deepEqual(result, expectedDate);
    });

    it('returns a Date object from "yyyy-mm-dd" format', () => {
      const dateStr = '1982-04-19';
      const expectedDate = new Date(1982, 3, 19);
      const result = collection.dateFromStr(dateStr);
      assert.deepEqual(result, expectedDate);
    });
  });

  describe('getNextYahrzeitHebrewDate, non-leap year', () => {
    before(() => {
      // Gregorian year 2023 begins in the midst of 5783 (non-leap year)
      const now = new Date(2023, 0, 1);
      sinon.useFakeTimers(now.getTime());
    });

    after(() => {
        sinon.restore()
    })

    it('returns the next yahrzeit Hebrew date', () => {
      const hebrewDateOfPassing = new HDate(11, 1, 5742);
      const expectedDate = new HDate(11, 1, 5783);
      const result = collection.getNextYahrzeitHebrewDate(hebrewDateOfPassing);
      assert.deepEqual(result, expectedDate);
    });

    it('throws an error for future dates', () => {
      const hebrewDateOfPassing = new HDate(1, 7, 5785);
      assert.throws(() => collection.getNextYahrzeitHebrewDate(hebrewDateOfPassing), RangeError);
    });

    it('Today is considered a next occurance of a yahrzeit', () => {
      const hebrewDateOfPassing = new HDate(8, 10, 5742);
      const expectedDate = new HDate(8, 10, 5783);
      const result = collection.getNextYahrzeitHebrewDate(hebrewDateOfPassing);
      assert.deepEqual(result, expectedDate);
    })

    it('Adar II dates are no problem. (Observed in Adar)', () => {
      const hebrewDateOfPassing = new HDate(12, 13, 5779);
      const expectedDate = new HDate(12, 12, 5783);
      const result = collection.getNextYahrzeitHebrewDate(hebrewDateOfPassing);
      assert.deepEqual(result, expectedDate);
    })

  });
  
  describe('getNextYahrzeitHebrewDate, leap year', () => {
    before(() => {
        // Gregorian year 2022 begins in the midst of 5782 (a leap year!)
      const now = new Date(2022, 0, 1);
      sinon.useFakeTimers(now.getTime());
    });

    after(() => {
        sinon.restore()
    })

    it('Adar dates return as Adar I', async () => {
      // 18th of Adar
      assert.deepEqual(collection.getNextYahrzeitHebrewDate(new HDate(18, 12, 5781)), new HDate(18, 12, 5782))
  })
  it('Adar II dates return as Adar II', async () => {
      // 12th of Adar II
      assert.deepEqual(collection.getNextYahrzeitHebrewDate(new HDate(12, 13, 5779)), new HDate(12, 13, 5782))
  })
    
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
      const result = collection.determineTargetYear(monthFilter);
      assert.equal(result, expectedYear);
    });
    
    it('returns the current year if the selected month is the current month', () => {
      const monthFilter = 2;
      const today = new Date();
      const expectedYear = today.getFullYear();
      const result = collection.determineTargetYear(monthFilter);
      assert.equal(result, expectedYear);
    });

    it('returns the next year if the selected month has passed', () => {
      const monthFilter = 1;
      const today = new Date();
      const expectedYear = today.getFullYear() + 1;
      const result = collection.determineTargetYear(monthFilter);
      assert.equal(result, expectedYear);
    });
  });

  describe('applyMonthFilter', () => {
    it('returns all forms if the month filter is 0', () => {
      const monthFilter = 0;
      const unfilteredData = [{ response: { month_number: 1, year: 2022 } }, { response: { month_number: 2, year: 2022 } }];
      collection.processedData = unfilteredData;
      collection.applyMonthFilter(monthFilter);
      assert.deepEqual(collection.filteredProcessedData, unfilteredData);
    });

    it('returns forms that match the month filter', () => {
      const monthFilter = 2;
      const unfilteredData = [
        { response: { month_number: 1, year: 2022 } },
        { response: { month_number: 2, year: 2022 } },
        { response: { month_number: 3, year: 2022 } },
      ];
      const expectedFilteredData = [{ response: { month_number: 2, year: 2022 } }];

      collection.determineTargetYear = () => 2022;
      collection.processedData = unfilteredData;
      collection.applyMonthFilter(monthFilter);
      assert.deepEqual(collection.filteredProcessedData, expectedFilteredData);
    });
  });

  describe('addCalculatedData', () => {
    before(() => {
      // Gregorian year 2022 begins in the midst of 5782 (a leap year!)
      const now = new Date(2024, 1, 25);
      sinon.useFakeTimers(now.getTime());
    });

    after(() => {
        sinon.restore()
    })
  
    it('should add calculated data to each form', () => {
      const form1 = {
        response: {
          [config.formConstants.gregorianDateOfPassingField]: '04/19/1982',
          [config.formConstants.sunsetField]: { value: config.formConstants.afterSunsetOption },
          [config.formConstants.observanceField]: { value: config.formConstants.gregorianCalendarOption }
        }
      };
      const form2 = {
        response: {
          [config.formConstants.gregorianDateOfPassingField]: '1982-04-19',
          [config.formConstants.sunsetField]: { value: config.formConstants.beforeSunsetOption },
          [config.formConstants.observanceField]: { value: config.formConstants.hebrewCalendarOption },
        }
      };
  
      collection.data = [form1, form2];
      collection.addCalculatedData();
  
      assert.equal(collection.processedData[0].greg_date_of_passing, 'April 19, 1982');
      assert.equal(collection.processedData[0].sunset_preposition, ' after sunset');
      assert.equal(collection.processedData[0].hebrew_date_of_passing, '27th of Nisan, 5742');
      assert.equal(collection.processedData[0].calendar, 'Gregorian');
      assert.equal(collection.processedData[0].next_yahrzeit_observed, 'April 19, 2024');
      assert.equal(collection.processedData[0].next_yahrzeit_gregorian, 'April 19, 2024');
      assert.equal(collection.processedData[0].month_number, 4);
      assert.equal(collection.processedData[0].year, 2024);
  
      assert.equal(collection.processedData[1].greg_date_of_passing, 'April 19, 1982');
      assert.equal(collection.processedData[1].sunset_preposition, ' before sunset');
      assert.equal(collection.processedData[1].hebrew_date_of_passing, '26th of Nisan, 5742');
      assert.equal(collection.processedData[1].calendar, 'Hebrew');
      assert.equal(collection.processedData[1].next_yahrzeit_observed, '26th of Nisan, 5784');
      assert.equal(collection.processedData[1].next_yahrzeit_gregorian, 'May 4, 2024');
      assert.equal(collection.processedData[1].month_number, 5);
      assert.equal(collection.processedData[1].year, 2024);
    });
  
    it('should skip forms with future date of passing', () => {
      const form = {
        response: {
          [config.formConstants.gregorianDateOfPassingField]: '04/19/2024',
          [config.formConstants.sunsetField]: { value: config.formConstants.afterSunsetOption },
          [config.formConstants.observanceField]: { value: config.formConstants.gregorianCalendarOption }
        }
      };
  
      collection.data = [form];
      collection.addCalculatedData();
  
      assert.deepEqual(collection.processedData[0], { response: { month_number: undefined, year: undefined } });

    });
  
    // Add more test cases for different scenarios...
  });
  
  describe('addProfileStatusData', () => {
    it('should add profile data to forms with profile IDs', async () => {
      const form1 = {
        person_id: 1,
        response: {
          [config.formConstants.personIdField]: 1,
        },
      };
      const form2 = {
        person_id: 2,
        response: {
          [config.formConstants.personIdField]: 2,
        },
      };
      const filteredProcessedDataWithProfileIds = [form1, form2];

      const profile1 = {
        id: 1,
        [config.formConstants.firstNameMournerField]: 'John',
        [config.formConstants.lastNameMournerField]: 'Doe',
        details: {
          [config.formConstants.profileStatusField]: { name: 'Member' },
        },
        [config.formConstants.profileEmailListField]: [
          { address: 'john.doe@example.com', isPrimaryField: '1', allowBulkField: '1' },
        ],
      };
      const profile2 = {
        id: 2,
        [config.formConstants.firstNameMournerField]: 'Jane',
        [config.formConstants.lastNameMournerField]: 'Smith',
        details: {
          [config.formConstants.profileStatusField]: { name: 'Deceased' },
        },
        [config.formConstants.profileEmailListField]: [
          { address: 'jane.smith@example.com', isPrimaryField: '1', allowBulkField: '1' },
        ],
      };

      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.withArgs('baseURL/profiles/1').resolves({
        json: () => Promise.resolve(profile1),
      });
      fetchStub.withArgs('baseURL/profiles/2').resolves({
        json: () => Promise.resolve(profile2),
      });

      collection.filteredProcessedData = filteredProcessedDataWithProfileIds;
      await collection.addProfileStatusData();

      assert.equal(collection.formsWithProfileIds.length, 2);
      assert.equal(collection.formsWithProfileIds[0].profile_first_name, 'John');
      assert.equal(collection.formsWithProfileIds[0].profile_last_name, 'Doe');
      assert.equal(collection.formsWithProfileIds[0].member_status, 'Member');
      assert.equal(collection.formsWithProfileIds[0].profile_email, 'john.doe@example.com');
      assert.equal(collection.formsWithProfileIds[1].profile_first_name, 'Jane');
      assert.equal(collection.formsWithProfileIds[1].profile_last_name, 'Smith');
      assert.equal(collection.formsWithProfileIds[1].member_status, 'Deceased');
      assert.equal(collection.formsWithProfileIds[1].profile_email, 'jane.smith@example.com');

      fetchStub.restore();
    });

    it('should skip forms without profile IDs', async () => {
      const form = {
        response: {
          [config.formConstants.personIdField]: null,
        },
      };
      const filteredProcessedDataWithProfileIds = [form];

      const fetchStub = sinon.stub(window, 'fetch');

      collection.filteredProcessedData = filteredProcessedDataWithProfileIds;
      await collection.addProfileStatusData();

      assert.equal(collection.formsWithProfileIds.length, 0);

      fetchStub.restore();
    });

    it('should handle errors when fetching profile info', async () => {
      const form = {
        person_id: 1,
        response: {
          [config.formConstants.personIdField]: 1,
        },
      };
      const filteredProcessedDataWithProfileIds = [form];

      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub.withArgs('baseURL/profiles/1').rejects(new Error('Failed to fetch profile info'));

      collection.filteredProcessedData = filteredProcessedDataWithProfileIds;
      await collection.addProfileStatusData();

      assert.equal(collection.formsWithProfileIds.length, 0);

      fetchStub.restore();
    });
  });


  // Add more test cases for other methods...
  // createYahrzeitCollection
  // sortByYahrzeitAsc

});
