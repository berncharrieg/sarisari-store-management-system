<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Str;

class ConvertCamelCase
{
    public function handle($request, Closure $next)
    {
        // Convert incoming request to snake_case
        $snakeInput = $this->convertKeysToSnakeCase($request->all());
        $request->replace($snakeInput);

        $response = $next($request);

        // Only convert JSON responses
        if ($response->headers->get('content-type') === 'application/json') {
            $data = json_decode($response->getContent(), true);

            if ($data !== null) {
                $camelData = $this->convertKeysToCamelCase($data);
                $response->setContent(json_encode($camelData));
            }
        }

        return $response;
    }

    private function convertKeysToSnakeCase($input)
    {
        if (!is_array($input)) {
            return $input;
        }

        $output = [];
        foreach ($input as $key => $value) {
            $output[Str::snake($key)] = $this->convertKeysToSnakeCase($value);
        }

        return $output;
    }

    private function convertKeysToCamelCase($input)
    {
        if (!is_array($input)) {
            return $input;
        }

        $output = [];
        foreach ($input as $key => $value) {
            $output[Str::camel($key)] = $this->convertKeysToCamelCase($value);
        }

        return $output;
    }
}
