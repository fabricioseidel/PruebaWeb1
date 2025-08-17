import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useProducts } from '../contexts/ProductContext';
import { ProductProvider } from '../contexts/ProductContext';

describe('ProductContext', () => {
  it('provides default values', () => {
    let value: any;
    function TestComponent() {
      value = useProducts();
      return <div>Test</div>;
    }
    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>
    );
    expect(value).not.toBeUndefined();
    expect(value.products).toBeDefined();
  });
});
