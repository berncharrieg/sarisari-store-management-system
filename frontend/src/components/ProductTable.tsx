import React from 'react';
import type { ProductTableProps} from './../types';



const ProductTable: React.FC<ProductTableProps> = ({ products, onUpdateStock, onDeleteProduct }) => {
  const renderDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString(); // e.g., "12/6/2025, 2:39:06 PM"
};

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Product List</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date Added</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Sold</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">{product.name}</td>
                <td className="px-4 py-3 text-gray-800">₱{parseFloat(product.price.toFixed(2))}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    product.stock === 0 ? 'bg-red-100 text-red-800' :
                    product.stock < 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {renderDate(product.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    product.totalSold === 0 ? 'bg-red-100 text-red-800' :
                    product.totalSold < 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {product.totalSold}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {/* <input
                      type="number"
                      defaultValue={product.stock}
                      onBlur={(e) => onUpdateStock(product.id, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    /> */}
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-gray-500 py-8">No products added yet</p>
        )}
      </div>
    </div>
  );
};

export default ProductTable;