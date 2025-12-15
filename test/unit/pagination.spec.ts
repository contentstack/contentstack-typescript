import { Pagination } from '../../src/lib/pagination';

describe('Pagination class', () => {

  it('should paginate the query with paginateObj skip and limit values when paginateObj is passed', () => {
    const pageObject = new Pagination().paginate({ skip: 10, limit: 10 });
    expect(pageObject).toBeInstanceOf(Pagination);
    expect(pageObject._queryParams).toEqual({ skip: 10, limit: 10 });
  });

  it('should change the skip value when next method is called', () => {
    const pageObject = new Pagination().paginate({ skip: 10, limit: 10 });
    expect(pageObject).toBeInstanceOf(Pagination);
    expect(pageObject._queryParams).toEqual({ skip: 10, limit: 10 });

    pageObject.next();
    expect(pageObject._queryParams).toEqual({ skip: 20, limit: 10 });
  });

  it('should change the skip value when previous method is called', () => {
    const pageObject = new Pagination().paginate({ skip: 10, limit: 10 });
    expect(pageObject).toBeInstanceOf(Pagination);
    expect(pageObject._queryParams).toEqual({ skip: 10, limit: 10 });

    pageObject.previous();
    expect(pageObject._queryParams).toEqual({ skip: 0, limit: 10 });
  });

  it('should initialize pagination when next is called without prior paginate', () => {
    const pageObject = new Pagination();
    pageObject.next();
    expect(pageObject._queryParams).toEqual({ skip: 10, limit: 10 });
  });

  it('should initialize pagination when previous is called without prior paginate', () => {
    const pageObject = new Pagination();
    pageObject.previous();
    expect(pageObject._queryParams).toEqual({ skip: 0, limit: 10 });
  });

  it('should set skip to 0 when previous would result in negative skip', () => {
    const pageObject = new Pagination().paginate({ skip: 5, limit: 10 });
    pageObject.previous();
    expect(pageObject._queryParams.skip).toEqual(0);
  });

  it('should use default values when paginate is called without arguments', () => {
    const pageObject = new Pagination().paginate();
    expect(pageObject._queryParams).toEqual({ skip: 0, limit: 10 });
  });
});
