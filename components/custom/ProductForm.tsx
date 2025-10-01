'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Image as ImageIcon, Plus, ChefHat, Sparkles, Upload, Edit3, CheckCircle } from 'lucide-react';
import { ExtractedRecipe } from '@/schemas/recipeSchemas';
import RecipeDialog from './RecipeDialog';

type RecipeInputMethod = 'manual' | 'ai-extraction' | null;

interface ProductFormData {
  name: string;
  description: string;
  basePrice: string;
  isFeatured: boolean;
  isAvailable: boolean;
  category: string;
  images: File[];
  unitType: string;
  minQuantity: number;
  maxQuantity: number;
  // Recipe fields
  recipeData: ExtractedRecipe | null;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  yield: string;
  instructions: string;
  equipment: string;
  ovenTemp: string;
  dietaryInfo: string;
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

  const [recipeInputMethod, setRecipeInputMethod] = useState<RecipeInputMethod>(null);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || '',
    isFeatured: initialData?.isFeatured || false,
    isAvailable: initialData?.isAvailable || true,
    category: initialData?.category || 'cookies',
    images: initialData?.images || [],
    unitType: initialData?.unitType || 'individual',
    minQuantity: initialData?.minQuantity || 1,
    maxQuantity: initialData?.maxQuantity || 100,
    recipeData: null,
    prepTime: '',
    cookTime: '',
    difficulty: 'medium',
    yield: '12 cookies',
    instructions: '',
    equipment: '',
    ovenTemp: '350°F',
    dietaryInfo: '',
  });

  const [units, setUnits] = useState<UnitData[]>([
    { name: 'Individual', quantity: 1, price: '', isDefault: true },
    { name: 'Half Dozen', quantity: 6, price: '', isDefault: false },
    { name: 'Dozen', quantity: 12, price: '', isDefault: false },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Recipe extraction state
  const [isExtractingRecipe, setIsExtractingRecipe] = useState(false);
  const [recipeExtractionError, setRecipeExtractionError] = useState<string | null>(null);
  const [recipeImages, setRecipeImages] = useState<File[]>([]);
  const recipeFileInputRef = useRef<HTMLInputElement>(null);

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

  // Recipe input method selection
  const selectRecipeMethod = (method: RecipeInputMethod) => {
    setRecipeInputMethod(method);
    if (method === 'ai-extraction') {
      setFormData(prev => ({
        ...prev,
        recipeData: null,
        recipeImages: [],
      }));
      setRecipeImages([]);
    }
  };

  // Recipe extraction functions
  const handleRecipeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setRecipeImages(prev => [...prev, ...files]);
  };

  const removeRecipeImage = (index: number) => {
    setRecipeImages(prev => prev.filter((_, i) => i !== index));
  };

  const extractRecipeData = async () => {
    if (recipeImages.length === 0) {
      setRecipeExtractionError('Please upload recipe images first');
      return;
    }

    setIsExtractingRecipe(true);
    setRecipeExtractionError(null);

    try {
      const formDataToSend = new FormData();
      recipeImages.forEach(image => {
        formDataToSend.append('images', image);
      });
      formDataToSend.append('productName', formData.name);
      formDataToSend.append('productDescription', formData.description);

      const response = await fetch('/api/recipes/extract', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract recipe data');
      }

      const extractedData = await response.json() as ExtractedRecipe;

      // Update form data with extracted information
      setFormData(prev => ({
        ...prev,
        recipeData: extractedData,
        name: extractedData.productName || prev.name,
        description: extractedData.productDescription || prev.description,
        category: extractedData.recipe.category,
        prepTime: extractedData.recipe.prepTime?.replace('PT', '').replace('H', 'h ').replace('M', 'min').toLowerCase() || '',
        cookTime: extractedData.recipe.cookTime?.replace('PT', '').replace('H', 'h ').replace('M', 'min').toLowerCase() || '',
        difficulty: extractedData.recipe.difficulty || 'medium',
        yield: `${extractedData.recipe.yield.amount} ${extractedData.recipe.yield.unit}`,
        instructions: extractedData.recipe.instructions.map((inst, idx) =>
          `${idx + 1}. ${inst.instruction}${inst.duration ? ` (${inst.duration})` : ''}${inst.temperature ? ` at ${inst.temperature}` : ''}`
        ).join('\n\n'),
        equipment: extractedData.recipe.equipment?.map(eq => eq.name).join(', ') || '',
        ovenTemp: extractedData.recipe.ovenTemperature?.fahrenheit ? `${extractedData.recipe.ovenTemperature.fahrenheit}°F` : '350°F',
        dietaryInfo: extractedData.recipe.dietaryTags?.join(', ') || '',
      }));

      // Clear recipe images after successful extraction
      setRecipeImages([]);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract recipe data';
      setRecipeExtractionError(errorMessage);
    } finally {
      setIsExtractingRecipe(false);
    }
  };

  const handleRecipeSave = (updatedRecipe: ExtractedRecipe) => {
    // Update form data with the edited recipe
    setFormData(prev => ({
      ...prev,
      recipeData: updatedRecipe,
      name: updatedRecipe.productName || prev.name,
      description: updatedRecipe.productDescription || prev.description,
      category: updatedRecipe.recipe.category,
      prepTime: updatedRecipe.recipe.prepTime?.replace('PT', '').replace('H', 'h ').replace('M', 'min').toLowerCase() || prev.prepTime,
      cookTime: updatedRecipe.recipe.cookTime?.replace('PT', '').replace('H', 'h ').replace('M', 'min').toLowerCase() || prev.cookTime,
      difficulty: updatedRecipe.recipe.difficulty || prev.difficulty,
      yield: `${updatedRecipe.recipe.yield.amount} ${updatedRecipe.recipe.yield.unit}`,
      instructions: updatedRecipe.recipe.instructions.map((inst, idx) =>
        `${idx + 1}. ${inst.instruction}${inst.duration ? ` (${inst.duration})` : ''}${inst.temperature ? ` at ${inst.temperature}` : ''}`
      ).join('\n\n'),
      equipment: updatedRecipe.recipe.equipment?.map(eq => eq.name).join(', ') || prev.equipment,
      ovenTemp: updatedRecipe.recipe.ovenTemperature?.fahrenheit ? `${updatedRecipe.recipe.ovenTemperature.fahrenheit}°F` : prev.ovenTemp,
      dietaryInfo: updatedRecipe.recipe.dietaryTags?.join(', ') || prev.dietaryInfo,
    }));
    setShowRecipeDialog(false);
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
      submitData.append('unitType', formData.unitType);
      submitData.append('minQuantity', formData.minQuantity.toString());
      submitData.append('maxQuantity', formData.maxQuantity.toString());
      submitData.append('units', JSON.stringify(units));
      
      // Add recipe data if available
      if (formData.recipeData) {
        submitData.append('recipeData', JSON.stringify(formData.recipeData));
      }
      
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
          <div>
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
            </div>

            <div className="mt-6">
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

            {/* Status Options */}
            <div className="mt-6 flex items-center gap-6">
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
          
          {/* Recipe Input Method Selection */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Add Recipe Information</h3>
            </div>

            {!recipeInputMethod ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => selectRecipeMethod('manual')}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-amber-500 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <Edit3 className="h-12 w-12 text-gray-400 group-hover:text-amber-600 mb-4 transition-colors" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Manual Entry</h4>
                    <p className="text-gray-600 text-sm">Enter recipe details manually for complete control over every aspect</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectRecipeMethod('ai-extraction')}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <Sparkles className="h-12 w-12 text-gray-400 group-hover:text-purple-600 mb-4 transition-colors" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Recipe Extraction</h4>
                    <p className="text-gray-600 text-sm">Upload recipe images and let AI extract ingredients, timing, and details</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Recipe Summary - Show when recipe is present */}
                {formData.recipeData ? (
                  <div className="bg-white rounded-xl border border-amber-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Recipe Added</h4>
                          <p className="text-sm text-gray-600">
                            {recipeInputMethod === 'ai-extraction' ? 'AI extracted recipe' : 'Manually entered recipe'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowRecipeDialog(true)}
                          className="text-sm bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit Recipe
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, recipeData: null }));
                            setRecipeInputMethod(null);
                            setRecipeImages([]);
                          }}
                          className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Recipe Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-amber-600 font-medium mb-1">Ingredients</p>
                        <p className="text-sm font-bold text-amber-900">{formData.recipeData?.recipe.ingredients.length || 0}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-blue-600 font-medium mb-1">Difficulty</p>
                        <p className="text-sm font-bold text-blue-900 capitalize">{formData.recipeData?.recipe.difficulty || 'N/A'}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-green-600 font-medium mb-1">Prep Time</p>
                        <p className="text-sm font-bold text-green-900">{formData.prepTime || 'N/A'}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-purple-600 font-medium mb-1">Yield</p>
                        <p className="text-sm font-bold text-purple-900">{formData.yield || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Recipe Re-extraction Option for AI */}
                    {recipeInputMethod === 'ai-extraction' && (
                      <div className="mt-4 pt-4 border-t border-amber-200">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, recipeData: null }));
                            setRecipeImages([]);
                          }}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          Extract a different recipe
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>  
                    {/* Method Selection Header */}
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        {recipeInputMethod === 'manual' ? (
                          <Edit3 className="h-6 w-6 text-amber-600" />
                        ) : (
                          <Sparkles className="h-6 w-6 text-purple-600" />
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {recipeInputMethod === 'manual' ? 'Manual Entry' : 'AI Recipe Extraction'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {recipeInputMethod === 'manual'
                              ? 'Enter your recipe details manually below'
                              : 'Upload recipe images for AI extraction'
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRecipeInputMethod(null);
                          setRecipeImages([]);
                          setFormData(prev => ({ ...prev, recipeData: null }));
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {recipeInputMethod === 'ai-extraction' && (
                  <>
                    {/* Recipe Image Upload */}
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        dragActive ? 'border-purple-500 bg-purple-50' : 'border-purple-300 hover:border-purple-400'
                      }`}
                    >
                      <input
                        type="file"
                        id="recipe-upload"
                        multiple
                        accept="image/*"
                        onChange={handleRecipeFileSelect}
                        ref={recipeFileInputRef}
                        className="hidden"
                      />
                      <label htmlFor="recipe-upload" className="cursor-pointer block">
                        <Upload className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Upload Recipe Images
                        </p>
                        <p className="text-sm text-gray-600">
                          Drag and drop recipe images here, or{' '}
                          <span className="font-medium text-purple-600 hover:text-purple-500">browse files</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB each</p>
                      </label>
                    </div>

                    {/* Recipe Images Preview */}
                    {recipeImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {recipeImages.map((file, idx) => (
                          <div key={idx} className="relative group">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`Recipe image ${idx + 1}`}
                              width={150}
                              height={150}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeRecipeImage(idx)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove recipe image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Extract Recipe Button */}
                    {recipeImages.length > 0 && (
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={extractRecipeData}
                          disabled={isExtractingRecipe}
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isExtractingRecipe ? (
                            <>
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Extracting Recipe...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5" />
                              Extract Recipe with AI
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Recipe Extraction Error */}
                    {recipeExtractionError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {recipeExtractionError}</span>
                      </div>
                    )}

                                      </>
                )}

                {/* Manual Recipe Form Fields - Only show when no recipe data and method is selected */}
                {recipeInputMethod === 'manual' && !formData.recipeData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prep Time
                      </label>
                      <input
                        type="text"
                        name="prepTime"
                        value={formData.prepTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., 30 minutes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cook Time
                      </label>
                      <input
                        type="text"
                        name="cookTime"
                        value={formData.cookTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., 25 minutes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yield
                      </label>
                      <input
                        type="text"
                        name="yield"
                        value={formData.yield}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., 12 cookies"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructions
                      </label>
                      <textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                        placeholder="Enter step-by-step instructions..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Needed
                      </label>
                      <input
                        type="text"
                        name="equipment"
                        value={formData.equipment}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., mixing bowls, whisk, baking sheets"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Oven Temperature
                      </label>
                      <input
                        type="text"
                        name="ovenTemp"
                        value={formData.ovenTemp}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., 350°F"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dietary Information
                      </label>
                      <input
                        type="text"
                        name="dietaryInfo"
                        value={formData.dietaryInfo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., vegetarian, gluten-free, nut-free"
                      />
                    </div>
                  </div>
                )}
                </>
              )}
            </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing Information</h3>

            {/* Base Price */}
            <div className="mb-6">
              <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                Base Price per Item ($) *
              </label>
              <input
                type="number"
                id="basePrice"
                name="basePrice"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={handleInputChange}
                className={`w-full md:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.basePrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2.50"
              />
              {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
            </div>

            {/* Pricing Units */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Pricing Units</h4>
              <p className="text-sm text-gray-600 mb-4">
                Set up different pricing options for your customers (individual, half dozen, dozen, etc.)
              </p>

              <div className="space-y-4">
                {units.map((unit, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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

                    <div className="flex items-center gap-3">
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

                      {units.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUnit(index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
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

        {/* Recipe Dialog */}
        <RecipeDialog
          isOpen={showRecipeDialog}
          onClose={() => setShowRecipeDialog(false)}
          onSave={handleRecipeSave}
          initialRecipe={formData.recipeData}
        />
      </div>
    </div>
  );
}
