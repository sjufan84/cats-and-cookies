'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExtractedRecipe, BakerRecipe, Ingredient, InstructionStep } from '@/schemas/recipeSchemas';
import {
  ChefHat,
  Clock,
  Users,
  Thermometer,
  Scale,
  AlertTriangle,
  Edit3,
  Save,
  Plus,
  Trash2,
  Flame,
  Check
} from 'lucide-react';

interface RecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: ExtractedRecipe) => void;
  initialRecipe: ExtractedRecipe | null;
}

export default function RecipeDialog({ isOpen, onClose, onSave, initialRecipe }: RecipeDialogProps) {
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'instructions' | 'details'>('overview');

  useEffect(() => {
    if (initialRecipe) {
      setRecipe(initialRecipe);
    }
  }, [initialRecipe]);

  if (!recipe) return null;

  const handleSave = () => {
    onSave(recipe);
    setIsEditing(false);
    onClose();
  };

  const handleCancel = () => {
    setRecipe(initialRecipe);
    setIsEditing(false);
  };

  const updateRecipe = (updates: Partial<BakerRecipe>) => {
    setRecipe(prev => prev ? {
      ...prev,
      recipe: { ...prev.recipe, ...updates }
    } : null);
  };

  const updateProductInfo = (updates: Partial<Pick<ExtractedRecipe, 'productName' | 'productDescription'>>) => {
    setRecipe(prev => prev ? { ...prev, ...updates } : null);
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      name: '',
      amount: '',
      unit: '',
      notes: '',
      category: 'other'
    };
    updateRecipe({
      ingredients: [...recipe.recipe.ingredients, newIngredient]
    });
  };

  const updateIngredient = (index: number, updates: Partial<Ingredient>) => {
    const updatedIngredients = [...recipe.recipe.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], ...updates };
    updateRecipe({ ingredients: updatedIngredients });
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = recipe.recipe.ingredients.filter((_, i) => i !== index);
    updateRecipe({ ingredients: updatedIngredients });
  };

  const addInstruction = () => {
    const newInstruction: InstructionStep = {
      stepNumber: recipe.recipe.instructions.length + 1,
      instruction: '',
      duration: '',
      temperature: '',
      technique: '',
      visualCue: '',
      tips: ''
    };
    updateRecipe({
      instructions: [...recipe.recipe.instructions, newInstruction]
    });
  };

  const updateInstruction = (index: number, updates: Partial<InstructionStep>) => {
    const updatedInstructions = [...recipe.recipe.instructions];
    updatedInstructions[index] = { ...updatedInstructions[index], ...updates };
    updateRecipe({ instructions: updatedInstructions });
  };

  const removeInstruction = (index: number) => {
    const updatedInstructions = recipe.recipe.instructions.filter((_, i) => i !== index);
    // Renumber remaining instructions
    const renumberedInstructions = updatedInstructions.map((instruction, i) => ({
      ...instruction,
      stepNumber: i + 1
    }));
    updateRecipe({ instructions: renumberedInstructions });
  };

  const formatTime = (time: string) => {
    if (!time) return '--';
    return time.replace('PT', '').replace('H', 'h ').replace('M', 'min').toLowerCase();
  };

  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Hard': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            {isEditing ? 'Edit Recipe Details' : 'Recipe Details'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isEditing
              ? 'Perfect your recipe by editing the extracted details below.'
              : 'Review your extracted recipe details. Click "Edit" to make any changes.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Product Information */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-amber-600" />
            Product Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={recipe.productName}
                  onChange={(e) => updateProductInfo({ productName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter product name"
                />
              ) : (
                <p className="text-gray-900 font-medium text-lg">{recipe.productName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Description
              </label>
              {isEditing ? (
                <textarea
                  value={recipe.productDescription}
                  onChange={(e) => updateProductInfo({ productDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                  placeholder="Describe your product"
                />
              ) : (
                <p className="text-gray-900">{recipe.productDescription}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {[
            { id: 'overview', label: 'Overview', icon: ChefHat },
            { id: 'ingredients', label: 'Ingredients', icon: Scale },
            { id: 'instructions', label: 'Instructions', icon: Edit3 },
            { id: 'details', label: 'Details', icon: AlertTriangle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-blue-900">Prep Time</span>
                  </div>
                  <p className="text-xl font-bold text-blue-800">{formatTime(recipe.recipe.prepTime)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-green-900">Cook Time</span>
                  </div>
                  <p className="text-xl font-bold text-green-800">{formatTime(recipe.recipe.cookTime)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-purple-900">Yield</span>
                  </div>
                  <p className="text-xl font-bold text-purple-800">
                    {recipe.recipe.yield.amount} {recipe.recipe.yield.unit}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
                  <p className="text-gray-800 capitalize">{recipe.recipe.category.replace('_', ' ')}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Difficulty</h4>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${getDifficultyColor(recipe.recipe.difficulty)}`}>
                    {formatDifficulty(recipe.recipe.difficulty)}
                  </span>
                </div>
              </div>

              {recipe.recipe.description && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h4 className="font-semibold text-amber-900 mb-3">Description</h4>
                  <p className="text-gray-800 leading-relaxed">{recipe.recipe.description}</p>
                </div>
              )}

              {recipe.keywords && recipe.keywords.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-white text-blue-800 px-3 py-1 rounded-lg text-sm font-medium border border-blue-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Scale className="h-6 w-6 text-amber-600" />
                  Ingredients ({recipe.recipe.ingredients.length})
                </h3>
                {isEditing && (
                  <Button onClick={addIngredient} className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                {recipe.recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              placeholder="Ingredient name"
                              value={ingredient.name}
                              onChange={(e) => updateIngredient(index, { name: e.target.value })}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                            <input
                              type="text"
                              placeholder="Amount"
                              value={ingredient.amount}
                              onChange={(e) => updateIngredient(index, { amount: e.target.value })}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                            <input
                              type="text"
                              placeholder="Unit"
                              value={ingredient.unit || ''}
                              onChange={(e) => updateIngredient(index, { unit: e.target.value })}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                            <input
                              type="text"
                              placeholder="Notes"
                              value={ingredient.notes || ''}
                              onChange={(e) => updateIngredient(index, { notes: e.target.value })}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                          </>
                        ) : (
                          <div className="col-span-4 flex flex-wrap items-center gap-3">
                            <span className="font-semibold text-gray-900">{ingredient.name}</span>
                            <span className="bg-white px-3 py-1 rounded-lg text-gray-800 border border-amber-300">
                              {ingredient.amount} {ingredient.unit}
                            </span>
                            {ingredient.notes && (
                              <span className="text-gray-600 italic">{ingredient.notes}</span>
                            )}
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <Button
                          onClick={() => removeIngredient(index)}
                          size="sm"
                          variant="destructive"
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Edit3 className="h-6 w-6 text-amber-600" />
                  Instructions ({recipe.recipe.instructions.length})
                </h3>
                {isEditing && (
                  <Button onClick={addInstruction} className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {recipe.recipe.instructions.map((instruction, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl overflow-hidden">
                    <div className="flex items-start gap-4 p-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        {instruction.stepNumber}
                      </div>
                      <div className="flex-1 space-y-4">
                        {isEditing ? (
                          <>
                            <textarea
                              placeholder="Instruction text"
                              value={instruction.instruction}
                              onChange={(e) => updateInstruction(index, { instruction: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input
                                type="text"
                                placeholder="Duration (e.g., 2-3 minutes)"
                                value={instruction.duration || ''}
                                onChange={(e) => updateInstruction(index, { duration: e.target.value })}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="Temperature (e.g., 350°F)"
                                value={instruction.temperature || ''}
                                onChange={(e) => updateInstruction(index, { temperature: e.target.value })}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="Technique (e.g., fold gently)"
                                value={instruction.technique || ''}
                                onChange={(e) => updateInstruction(index, { technique: e.target.value })}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Visual cue (e.g., until light and fluffy)"
                              value={instruction.visualCue || ''}
                              onChange={(e) => updateInstruction(index, { visualCue: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Baker's tips"
                              value={instruction.tips || ''}
                              onChange={(e) => updateInstruction(index, { tips: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </>
                        ) : (
                          <div>
                            <p className="text-gray-900 text-lg leading-relaxed mb-3">{instruction.instruction}</p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              {instruction.duration && (
                                <span className="bg-white px-3 py-1 rounded-lg text-blue-800 border border-blue-300 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {instruction.duration}
                                </span>
                              )}
                              {instruction.temperature && (
                                <span className="bg-white px-3 py-1 rounded-lg text-orange-800 border border-orange-300 flex items-center gap-1">
                                  <Thermometer className="h-3 w-3" />
                                  {instruction.temperature}
                                </span>
                              )}
                              {instruction.technique && (
                                <span className="bg-white px-3 py-1 rounded-lg text-purple-800 border border-purple-300">
                                  {instruction.technique}
                                </span>
                              )}
                            </div>
                            {instruction.visualCue && (
                              <div className="mt-3 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800 flex items-start gap-2">
                                  <span className="text-blue-600">💡</span>
                                  {instruction.visualCue}
                                </p>
                              </div>
                            )}
                            {instruction.tips && (
                              <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800 flex items-start gap-2">
                                  <span className="text-green-600">✨</span>
                                  {instruction.tips}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <Button
                          onClick={() => removeInstruction(index)}
                          size="sm"
                          variant="destructive"
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl p-6">
                  <h4 className="font-semibold text-rose-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                    Allergens
                  </h4>
                  {recipe.recipe.allergens.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recipe.recipe.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="bg-white text-rose-800 px-3 py-2 rounded-lg text-sm font-medium border border-rose-300"
                        >
                          {allergen.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-rose-700 italic">No allergens detected</p>
                  )}
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
                  <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    Dietary Information
                  </h4>
                  {recipe.recipe.dietaryTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recipe.recipe.dietaryTags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-white text-emerald-800 px-3 py-2 rounded-lg text-sm font-medium border border-emerald-300"
                        >
                          {tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-emerald-700 italic">No dietary tags</p>
                  )}
                </div>
              </div>

              {recipe.recipe.equipment && recipe.recipe.equipment.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                  <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-purple-600" />
                    Equipment Needed
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recipe.recipe.equipment.map((equipment, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-purple-300">
                        <p className="font-semibold text-gray-900">{equipment.name}</p>
                        {equipment.size && <p className="text-sm text-gray-600 mt-1">Size: {equipment.size}</p>}
                        {equipment.material && <p className="text-sm text-gray-600">Material: {equipment.material}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recipe.recipe.ovenTemperature && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
                  <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-orange-600" />
                    Oven Temperature
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-orange-300">
                    {recipe.recipe.ovenTemperature.fahrenheit && (
                      <p className="text-xl font-bold text-orange-800">{recipe.recipe.ovenTemperature.fahrenheit}°F</p>
                    )}
                    {recipe.recipe.ovenTemperature.celsius && (
                      <p className="text-lg font-semibold text-orange-700 mt-1">{recipe.recipe.ovenTemperature.celsius}°C</p>
                    )}
                    {recipe.recipe.ovenTemperature.setting && (
                      <p className="text-sm text-gray-600 mt-2">Setting: {recipe.recipe.ovenTemperature.setting}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-gray-200">
          <div className="flex justify-between w-full">
            <div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Recipe
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {isEditing && (
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              )}
              <Button onClick={onClose} variant="outline">
                {isEditing ? 'Close' : 'Done'}
              </Button>
              {isEditing && (
                <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
