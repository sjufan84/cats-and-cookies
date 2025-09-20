'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Image as ImageIcon, Plus } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  basePrice: string;
  isFeatured: boolean;
  isAvailable: boolean;
  category: string;
  ingredients: string;
  allergens: string;
  images: File[];
  unitType: string;
  minQuantity: number;
  maxQuantity: number;
}

interface UnitData {
  name: string;
  quantity: number;
  price: string;
  isDefault: boolean;
}

interface ProductFormProps {
  productId?: number;
  initialData?: Partial<ProductFormData>;
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || '',
    isFeatured: initialData?.isFeatured || false,
    isAvailable: initialData?.isAvailable || true,
    category: initialData?.category || 'cookies',
    ingredients: initialData?.ingredients || '',
    allergens: initialData?.allergens || '',
    images: initialData?.images || [],
    unitType: initialData?.unitType || 'individual',
    minQuantity: initialData?.minQuantity || 1,
    maxQuantity: initialData?.maxQuantity || 100,
  });

  const [units, setUnits] = useState<UnitData[]>([
    { name: 'Individual', quantity: 1, price: '', isDefault: true },
    { name: 'Half Dozen', quantity: 6, price: '', isDefault: false },
    { name: 'Dozen', quantity: 12, price: '', isDefault: false },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate unit prices when base price changes
  const updateUnitPrices = (basePrice: string) => {
    const price = parseFloat(basePrice) || 0;
    setUnits(prev => prev.map(unit => ({
      ...unit,
      price: unit.quantity === 1 
        ? basePrice 
        : (price * unit.quantity * (unit.quantity === 6 ? 0.9 : unit.quantity === 12 ? 0.85 : 1)).toFixed(2)
    })));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Update unit prices when base price changes
      if (name === 'basePrice') {
        updateUnitPrices(value);
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUnitChange = (index: number, field: keyof UnitData, value: string | number | boolean) => {
    setUnits(prev => prev.map((unit, i) => 
      i === index ? { ...unit, [field]: value } : unit
    ));
  };

  const addUnit = () => {
    setUnits(prev => [...prev, { name: '', quantity: 1, price: '', isDefault: false }]);
  };

  const removeUnit = (index: number) => {
    if (units.length > 1) {
      setUnits(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );
    
    if (imageFiles.length === 0) {
      setErrors(prev => ({ ...prev, images: 'Please select valid image files (max 5MB each)' }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
    
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    if (!formData.basePrice.trim()) {
      newErrors.basePrice = 'Base price is required';
    } else if (isNaN(parseFloat(formData.basePrice)) || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Please enter a valid base price';
    }
    
    // Validate units
    if (units.length === 0) {
      newErrors.units = 'At least one pricing unit is required';
    } else {
      units.forEach((unit, index) => {
        if (!unit.name.trim()) {
          newErrors[`unit_${index}_name`] = 'Unit name is required';
        }
        if (unit.quantity <= 0) {
          newErrors[`unit_${index}_quantity`] = 'Quantity must be greater than 0';
        }
        if (!unit.price.trim() || isNaN(parseFloat(unit.price)) || parseFloat(unit.price) <= 0) {
          newErrors[`unit_${index}_price`] = 'Please enter a valid price';
        }
      });
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('basePrice', formData.basePrice);
      submitData.append('isFeatured', formData.isFeatured.toString());
      submitData.append('isAvailable', formData.isAvailable.toString());
      submitData.append('category', formData.category);
      submitData.append('ingredients', formData.ingredients);
      submitData.append('allergens', formData.allergens);
      submitData.append('unitType', formData.unitType);
      submitData.append('minQuantity', formData.minQuantity.toString());
      submitData.append('maxQuantity', formData.maxQuantity.toString());
      submitData.append('units', JSON.stringify(units));
      
      // Append images
      formData.images.forEach((image) => {
        submitData.append(`images`, image);
      });
      
      const endpoint = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        body: submitData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }
      
      await response.json();
      
      // Redirect to products page or admin
      router.push('/admin/inventory');
      router.refresh();
      
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {productId ? 'Edit Product' : 'Add New Product'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Chocolate Chip Cookies"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                Base Price per Cookie ($) *
              </label>
              <input
                type="number"
                id="basePrice"
                name="basePrice"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.basePrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2.50"
              />
              {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your delicious cookies..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          
          {/* Category and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="cookies">Cookies</option>
                <option value="cakes">Cakes</option>
                <option value="pastries">Pastries</option>
                <option value="specialty">Specialty</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Featured Product</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Available for Sale</span>
              </label>
            </div>
          </div>

          {/* Unit Management */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing Units</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set up different pricing options for your customers (individual, half dozen, dozen, etc.)
            </p>
            
            <div className="space-y-4">
              {units.map((unit, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Name
                    </label>
                    <input
                      type="text"
                      value={unit.name}
                      onChange={(e) => handleUnitChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g., Individual, Half Dozen"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={unit.quantity}
                      onChange={(e) => handleUnitChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={unit.price}
                      onChange={(e) => handleUnitChange(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={unit.isDefault}
                        onChange={(e) => {
                          // Unset other defaults when this one is checked
                          if (e.target.checked) {
                            setUnits(prev => prev.map((u, i) => ({
                              ...u,
                              isDefault: i === index
                            })));
                          } else {
                            handleUnitChange(index, 'isDefault', false);
                          }
                        }}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Default</span>
                    </label>
                  </div>
                  
                  <div>
                    {units.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUnit(index)}
                        className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addUnit}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-pink-500 hover:text-pink-600 transition-colors"
              >
                + Add Another Unit
              </button>
            </div>
          </div>
          
          {/* Ingredients and Allergens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients
              </label>
              <textarea
                id="ingredients"
                name="ingredients"
                rows={3}
                value={formData.ingredients}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="List main ingredients..."
              />
            </div>
            
            <div>
              <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-2">
                Allergens
              </label>
              <textarea
                id="allergens"
                name="allergens"
                rows={3}
                value={formData.allergens}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Contains: nuts, dairy, etc."
              />
            </div>
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images *
            </label>
            
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-pink-500 bg-pink-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                Drag and drop images here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-pink-600 hover:text-pink-500 font-medium"
                >
                  browse files
                </button>
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 5MB each
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
            
            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
            
            {/* Selected Images Preview */}
            {formData.images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, idx) => (
                    <div key={idx} className="relative group">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${idx + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {productId ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
          
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
