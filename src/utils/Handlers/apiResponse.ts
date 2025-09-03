type Meta = {
  [key: string]: any;
};

type SuccessResponse<T = any> = {
  statusCode: number;
  body: {
    data: T;
    meta: Meta;
  };
};

type PaginatedLinks = {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
};

type PaginationMeta = {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
};

type PaginatedResponse<T> = {
  data: T[];
  links: PaginatedLinks;
  meta: PaginationMeta;
};

class ApiResponse {
  static success<T = any>(
    data: T = {} as T,
    meta: Meta = {},
    statusCode: number = 200
  ): SuccessResponse<T> {
    return {
      statusCode,
      body: {
        data,
        meta,
      },
    };
  }

  static paginated<T = any>(
    data: T[],
    count: number,
    page: number | string,
    limit: number | string,
    baseUrl: string
  ): PaginatedResponse<T> {
    const currentPage = typeof page === "string" ? parseInt(page) : page;
    const perPage = typeof limit === "string" ? parseInt(limit) : limit;

    const totalPages = Math.ceil(count / perPage);
    const from = (currentPage - 1) * perPage + 1;
    const to = Math.min(from + data.length - 1, count);

    const buildLink = (p: number) => `${baseUrl}?page=${p}&limit=${perPage}`;

    return {
      data,
      links: {
        first: buildLink(1),
        last: buildLink(totalPages),
        prev: currentPage > 1 ? buildLink(currentPage - 1) : null,
        next: currentPage < totalPages ? buildLink(currentPage + 1) : null,
      },
      meta: {
        current_page: currentPage,
        from,
        last_page: totalPages,
        per_page: perPage,
        to,
        total: count,
      },
    };
  }
}

export default ApiResponse;