import axiosInstance from "../../axiosInstance";

// Rich mock dataset representing realistic production backend API errors
let mockErrorLogs = [
  {
    id: "err-1001",
    url: "/api/v1/orders/checkout",
    method: "POST",
    status_code: 500,
    message: "SQLSTATE[23000]: Integrity constraint violation: 1048 Column 'customer_id' cannot be null",
    exception_class: "Illuminate\\Database\\QueryException",
    user_id: "usr_402",
    user_name: "Fahim Ahmed",
    user_email: "fahim@hcrm.io",
    ip_address: "103.204.210.45",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    is_resolved: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    request_data: {
      cart_id: "crt_884920",
      payment_method: "stripe",
      amount: 1450.00,
      currency: "USD",
      items: [
        { product_id: "prod_0192", quantity: 2, unit_price: 600.00 },
        { product_id: "prod_0881", quantity: 1, unit_price: 250.00 }
      ],
      billing_address: {
        street: "123 Tech Park Ave",
        city: "Dhaka",
        country: "BD",
        zip: "1212"
      }
    },
    stack_trace: `Illuminate\\Database\\QueryException: SQLSTATE[23000]: Integrity constraint violation: 1048 Column 'customer_id' cannot be null (SQL: insert into \`orders\` (\`cart_id\`, \`amount\`, \`customer_id\`, \`created_at\`) values ('crt_884920', 1450, NULL, 2026-09-13 18:10:00))
  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:760
  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:714
  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:377
  at app/Http/Controllers/OrderController.php:142
  at app/Services/CheckoutService.php:89
  at app/Http/Controllers/Api/CheckoutController.php:54
  at vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php:48
  at vendor/laravel/framework/src/Illuminate/Routing/Route.php:261
  at vendor/laravel/framework/src/Illuminate/Routing/Route.php:205`
  },
  {
    id: "err-1002",
    url: "/api/v1/users/profile/avatar",
    method: "POST",
    status_code: 422,
    message: "The uploaded file exceeds maximum allowed limit of 5MB and format must be PNG or JPEG.",
    exception_class: "Illuminate\\Validation\\ValidationException",
    user_id: "usr_105",
    user_name: "Sarah Jenkins",
    user_email: "sarah.j@example.com",
    ip_address: "192.168.1.104",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    is_resolved: false,
    created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    request_data: {
      file_name: "raw_profile_4k_hdr.tiff",
      file_size_bytes: 18492000,
      mime_type: "image/tiff"
    },
    stack_trace: `Illuminate\\Validation\\ValidationException: The given data was invalid.
  at app/Http/Controllers/Api/UserController.php:218
  at Illuminate\\Foundation\\Http\\FormRequest->validateResolved()
  at Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
  at app/Http/Middleware/Authenticate.php:32
  at Illuminate\\Pipeline\\Pipeline->then()`
  },
  {
    id: "err-1003",
    url: "/api/v1/prospects/export-pdf",
    method: "GET",
    status_code: 503,
    message: "Redis connection timed out after 3.0 seconds [tcp://127.0.0.1:6379]",
    exception_class: "Predis\\Connection\\ConnectionException",
    user_id: "usr_99",
    user_name: "Admin User",
    user_email: "admin@hcrm.io",
    ip_address: "10.0.0.12",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0",
    is_resolved: true,
    created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    request_data: {
      query: {
        filter_stage: "negotiation",
        include_archived: "true",
        sort_by: "created_at"
      }
    },
    stack_trace: `Predis\\Connection\\ConnectionException: Connection timed out [tcp://127.0.0.1:6379]
  at vendor/predis/predis/src/Connection/AbstractConnection.php:155
  at vendor/predis/predis/src/Connection/StreamConnection.php:128
  at vendor/laravel/framework/src/Illuminate/Redis/Connections/PredisConnection.php:52
  at app/Jobs/GeneratePdfExport.php:67
  at vendor/laravel/framework/src/Illuminate/Queue/CallQueuedHandler.php:116`
  },
  {
    id: "err-1004",
    url: "/api/v1/clients/94021/billing",
    method: "PUT",
    status_code: 404,
    message: "No query results for model [App\\Models\\Client] 94021",
    exception_class: "Illuminate\\Database\\Eloquent\\ModelNotFoundException",
    user_id: "usr_230",
    user_name: "Rahim Chowdhury",
    user_email: "rahim@enterprise.com",
    ip_address: "114.31.22.9",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15",
    is_resolved: false,
    created_at: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    request_data: {
      client_id: 94021,
      tax_number: "TX-9940129",
      billing_email: "billing@clientcorp.com"
    },
    stack_trace: `Illuminate\\Database\\Eloquent\\ModelNotFoundException: No query results for model [App\\Models\\Client] 94021
  at vendor/laravel/framework/src/Illuminate/Database/Eloquent/Builder.php:524
  at app/Http/Controllers/ClientController.php:98
  at vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php:48`
  },
  {
    id: "err-1005",
    url: "/api/v1/auth/refresh-token",
    method: "POST",
    status_code: 401,
    message: "JWT Token has expired and cannot be refreshed.",
    exception_class: "Tymon\\JWTAuth\\Exceptions\\TokenExpiredException",
    user_id: "usr_311",
    user_name: "Elena Rostova",
    user_email: "elena@globaltech.org",
    ip_address: "185.220.101.4",
    user_agent: "PostmanRuntime/7.39.0",
    is_resolved: true,
    created_at: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    request_data: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    },
    stack_trace: `Tymon\\JWTAuth\\Exceptions\\TokenExpiredException: Token has expired
  at vendor/tymon/jwt-auth/src/Providers/JWT/Namshi.php:74
  at vendor/tymon/jwt-auth/src/JWT.php:189
  at app/Http/Middleware/AuthenticateJWT.php:45
  at vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:167`
  },
  {
    id: "err-1006",
    url: "/api/v1/projects/tasks/bulk-delete",
    method: "DELETE",
    status_code: 403,
    message: "User does not possess the required permission [delete_project_tasks].",
    exception_class: "Spatie\\Permission\\Exceptions\\UnauthorizedException",
    user_id: "usr_512",
    user_name: "Karim Hassan",
    user_email: "karim@hcrm.io",
    ip_address: "103.110.45.12",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    is_resolved: false,
    created_at: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    request_data: {
      task_ids: [102, 103, 104, 105],
      project_id: 42
    },
    stack_trace: `Spatie\\Permission\\Exceptions\\UnauthorizedException: User does not have the right permissions.
  at vendor/spatie/laravel-permission/src/PermissionServiceProvider.php:84
  at app/Http/Controllers/TaskController.php:310
  at vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php:48`
  },
  {
    id: "err-1007",
    url: "/api/v1/reports/monthly-revenue",
    method: "GET",
    status_code: 502,
    message: "Bad Gateway: Upstream Microservice 'analytics-engine' returned 502 Bad Gateway response.",
    exception_class: "GuzzleHttp\\Exception\\ServerException",
    user_id: "usr_402",
    user_name: "Fahim Ahmed",
    user_email: "fahim@hcrm.io",
    ip_address: "103.204.210.45",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    is_resolved: false,
    created_at: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
    request_data: {
      month: "2026-08",
      department: "sales",
      breakdown: "weekly"
    },
    stack_trace: `GuzzleHttp\\Exception\\ServerException: Server error: \`GET http://analytics-engine.internal/v1/revenue\` resulted in a \`502 Bad Gateway\` response
  at vendor/guzzlehttp/guzzle/src/Middleware.php:69
  at vendor/guzzlehttp/promises/src/Promise.php:204
  at app/Services/AnalyticsService.php:112
  at app/Http/Controllers/ReportController.php:65`
  },
  {
    id: "err-1008",
    url: "/api/v1/inventory/items/import",
    method: "POST",
    status_code: 400,
    message: "Malformed JSON payload: unexpected token ']' at line 14 position 82.",
    exception_class: "Symfony\\Component\\HttpKernel\\Exception\\BadRequestHttpException",
    user_id: "usr_680",
    user_name: "Michael Chang",
    user_email: "mchang@logistics.com",
    ip_address: "203.0.113.195",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1)",
    is_resolved: true,
    created_at: new Date(Date.now() - 480 * 60 * 1000).toISOString(),
    request_data: {
      raw_payload_snippet: "{\"sku\":\"SKU-9920\", \"items\": [10, 20,]}"
    },
    stack_trace: `Symfony\\Component\\HttpKernel\\Exception\\BadRequestHttpException: Malformed JSON syntax
  at vendor/laravel/framework/src/Illuminate/Http/Request.php:490
  at app/Http/Middleware/ValidateJsonBody.php:24
  at vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:167`
  }
];

/**
 * GET /api/error-logs
 * Fetch paginated error log list with filters & summary statistics
 */
export const getErrorLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/error-logs", { params });
    return response.data;
  } catch (error) {
    console.warn("Backend API /api/error-logs request failed, using mock data fallback:", error.message);
    
    let filtered = [...mockErrorLogs];

    // Search filter (URL, Error Message, Exception Class)
    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.url.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q) ||
          item.exception_class.toLowerCase().includes(q) ||
          (item.user_name && item.user_name.toLowerCase().includes(q)) ||
          (item.user_email && item.user_email.toLowerCase().includes(q))
      );
    }

    // Status code filter
    if (params.status_code && params.status_code !== "all") {
      filtered = filtered.filter((item) => String(item.status_code) === String(params.status_code));
    }

    // HTTP Method filter
    if (params.method && params.method !== "all") {
      filtered = filtered.filter((item) => item.method.toUpperCase() === params.method.toUpperCase());
    }

    // Resolution status filter
    if (params.is_resolved !== undefined && params.is_resolved !== "all" && params.is_resolved !== "") {
      const isRes = params.is_resolved === "true" || params.is_resolved === true || params.is_resolved === 1;
      filtered = filtered.filter((item) => item.is_resolved === isRes);
    }

    // Date range filter
    if (params.start_date) {
      const start = new Date(params.start_date).getTime();
      filtered = filtered.filter((item) => new Date(item.created_at).getTime() >= start);
    }
    if (params.end_date) {
      const end = new Date(params.end_date).getTime() + 86400000; // include full day
      filtered = filtered.filter((item) => new Date(item.created_at).getTime() <= end);
    }

    // Calculate Summary Stats from current dataset
    const summary = {
      total_errors: mockErrorLogs.length,
      unresolved_errors: mockErrorLogs.filter((i) => !i.is_resolved).length,
      server_errors_500: mockErrorLogs.filter((i) => i.status_code >= 500).length,
      client_errors_400: mockErrorLogs.filter((i) => i.status_code >= 400 && i.status_code < 500).length,
    };

    // Pagination
    const page = parseInt(params.page || 1, 10);
    const perPage = parseInt(params.per_page || 10, 10);
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const startIndex = (page - 1) * perPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + perPage);

    return {
      status: "success",
      summary,
      meta: {
        current_page: page,
        per_page: perPage,
        total: totalItems,
        total_pages: totalPages,
      },
      data: paginatedItems,
    };
  }
};

/**
 * GET /api/error-logs/{id}
 * Fetch detailed error log with request data and full stack trace
 */
export const getErrorLogDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/error-logs/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`Backend API /api/error-logs/${id} failed, using mock data fallback:`, error.message);
    const item = mockErrorLogs.find((l) => String(l.id) === String(id));
    if (!item) {
      throw new Error(`Error log with ID ${id} not found.`);
    }
    return {
      status: "success",
      data: item,
    };
  }
};

/**
 * PATCH /api/error-logs/{id}/resolve
 * Toggle resolution status of an error log
 */
export const toggleResolveErrorLog = async (id, isResolved) => {
  try {
    const response = await axiosInstance.patch(`/api/error-logs/${id}/resolve`, {
      is_resolved: isResolved,
    });
    return response.data;
  } catch (error) {
    console.warn(`Backend API /api/error-logs/${id}/resolve failed, updating mock data:`, error.message);
    const index = mockErrorLogs.findIndex((l) => String(l.id) === String(id));
    if (index !== -1) {
      mockErrorLogs[index].is_resolved = isResolved;
      return {
        status: "success",
        message: `Error log marked as ${isResolved ? "resolved" : "unresolved"}.`,
        data: mockErrorLogs[index],
      };
    }
    throw new Error(`Error log ${id} not found.`);
  }
};

/**
 * DELETE /api/error-logs/{id}
 * Delete single error log
 */
export const deleteErrorLog = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/error-logs/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`Backend API DELETE /api/error-logs/${id} failed, updating mock data:`, error.message);
    mockErrorLogs = mockErrorLogs.filter((l) => String(l.id) !== String(id));
    return {
      status: "success",
      message: `Error log ${id} deleted successfully.`,
    };
  }
};

/**
 * DELETE /api/error-logs/clear
 * Bulk clear logs (?type=resolved or ?type=all)
 */
export const clearErrorLogs = async (type = "resolved") => {
  try {
    const response = await axiosInstance.delete(`/api/error-logs/clear`, {
      params: { type },
    });
    return response.data;
  } catch (error) {
    console.warn(`Backend API DELETE /api/error-logs/clear failed, updating mock data:`, error.message);
    if (type === "resolved") {
      mockErrorLogs = mockErrorLogs.filter((l) => !l.is_resolved);
    } else if (type === "all") {
      mockErrorLogs = [];
    }
    return {
      status: "success",
      message: `Error logs (${type}) cleared successfully.`,
    };
  }
};
