import { db } from './db';
import { productUnits } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export interface ProductUnit {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: string;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export interface CreateUnitData {
  name: string;
  quantity: number;
  price: string;
  isDefault?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;
}

export class ProductUnitManager {
  /**
   * Get all units for a product
   */
  static async getProductUnits(productId: number): Promise<ProductUnit[]> {
    const units = await db
      .select()
      .from(productUnits)
      .where(
        and(
          eq(productUnits.productId, productId),
          eq(productUnits.isAvailable, true)
        )
      )
      .orderBy(asc(productUnits.sortOrder), asc(productUnits.quantity));

    return units.map(unit => ({
      id: unit.id,
      productId: unit.productId,
      name: unit.name,
      quantity: unit.quantity,
      price: unit.price,
      isDefault: unit.isDefault,
      isAvailable: unit.isAvailable,
      sortOrder: unit.sortOrder,
    }));
  }

  /**
   * Get the default unit for a product
   */
  static async getDefaultUnit(productId: number): Promise<ProductUnit | null> {
    const [unit] = await db
      .select()
      .from(productUnits)
      .where(
        and(
          eq(productUnits.productId, productId),
          eq(productUnits.isDefault, true),
          eq(productUnits.isAvailable, true)
        )
      )
      .limit(1);

    if (!unit) return null;

    return {
      id: unit.id,
      productId: unit.productId,
      name: unit.name,
      quantity: unit.quantity,
      price: unit.price,
      isDefault: unit.isDefault,
      isAvailable: unit.isAvailable,
      sortOrder: unit.sortOrder,
    };
  }

  /**
   * Create a new unit for a product
   */
  static async createUnit(productId: number, unitData: CreateUnitData): Promise<ProductUnit> {
    // If this is set as default, unset other defaults
    if (unitData.isDefault) {
      await db
        .update(productUnits)
        .set({ isDefault: false })
        .where(eq(productUnits.productId, productId));
    }

    const [newUnit] = await db
      .insert(productUnits)
      .values({
        productId,
        name: unitData.name,
        quantity: unitData.quantity,
        price: unitData.price,
        isDefault: unitData.isDefault || false,
        isAvailable: unitData.isAvailable !== false,
        sortOrder: unitData.sortOrder || 0,
      })
      .returning();

    return {
      id: newUnit.id,
      productId: newUnit.productId,
      name: newUnit.name,
      quantity: newUnit.quantity,
      price: newUnit.price,
      isDefault: newUnit.isDefault,
      isAvailable: newUnit.isAvailable,
      sortOrder: newUnit.sortOrder,
    };
  }

  /**
   * Create default units for a product (individual, half dozen, dozen)
   */
  static async createDefaultUnits(productId: number, basePrice: string): Promise<ProductUnit[]> {
    const defaultUnits = [
      {
        name: 'Individual',
        quantity: 1,
        price: basePrice,
        isDefault: true,
        sortOrder: 1,
      },
      {
        name: 'Half Dozen',
        quantity: 6,
        price: (parseFloat(basePrice) * 6 * 0.9).toFixed(2), // 10% discount
        isDefault: false,
        sortOrder: 2,
      },
      {
        name: 'Dozen',
        quantity: 12,
        price: (parseFloat(basePrice) * 12 * 0.85).toFixed(2), // 15% discount
        isDefault: false,
        sortOrder: 3,
      },
    ];

    const createdUnits: ProductUnit[] = [];
    
    for (const unitData of defaultUnits) {
      const unit = await this.createUnit(productId, unitData);
      createdUnits.push(unit);
    }

    return createdUnits;
  }

  /**
   * Update a unit
   */
  static async updateUnit(unitId: number, unitData: Partial<CreateUnitData>): Promise<ProductUnit> {
    // If this is set as default, unset other defaults
    if (unitData.isDefault) {
      const [unit] = await db
        .select({ productId: productUnits.productId })
        .from(productUnits)
        .where(eq(productUnits.id, unitId))
        .limit(1);

      if (unit) {
        await db
          .update(productUnits)
          .set({ isDefault: false })
          .where(eq(productUnits.productId, unit.productId));
      }
    }

    const [updatedUnit] = await db
      .update(productUnits)
      .set({
        ...unitData,
        updatedAt: new Date(),
      })
      .where(eq(productUnits.id, unitId))
      .returning();

    return {
      id: updatedUnit.id,
      productId: updatedUnit.productId,
      name: updatedUnit.name,
      quantity: updatedUnit.quantity,
      price: updatedUnit.price,
      isDefault: updatedUnit.isDefault,
      isAvailable: updatedUnit.isAvailable,
      sortOrder: updatedUnit.sortOrder,
    };
  }

  /**
   * Delete a unit
   */
  static async deleteUnit(unitId: number): Promise<void> {
    await db
      .delete(productUnits)
      .where(eq(productUnits.id, unitId));
  }

  /**
   * Get unit by ID
   */
  static async getUnitById(unitId: number): Promise<ProductUnit | null> {
    const [unit] = await db
      .select()
      .from(productUnits)
      .where(eq(productUnits.id, unitId))
      .limit(1);

    if (!unit) return null;

    return {
      id: unit.id,
      productId: unit.productId,
      name: unit.name,
      quantity: unit.quantity,
      price: unit.price,
      isDefault: unit.isDefault,
      isAvailable: unit.isAvailable,
      sortOrder: unit.sortOrder,
    };
  }
}
