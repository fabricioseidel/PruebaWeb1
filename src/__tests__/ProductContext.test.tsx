import React from 'react';
import { render } from '@testing-library/react';
import { useProducts } from '../contexts/ProductContext';
import { ProductContext, ProductProvider } from '../contexts/ProductContext';

describe('ProductContext', () => {
  it('provides default values', () => {
    let value;
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
