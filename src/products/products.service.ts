import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }

  async create(createProductDto: CreateProductDto) {
    const createdProduct = await this.productModel.create(createProductDto);
    return createdProduct;
  }

  async findAll() {
    const all = await this.productModel.find({});
    return all;
  }

  async findOne(id: string) {
    const product = await this.productModel.findOne({ _id: id });
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const updated = await this.productModel.findByIdAndUpdate({ _id: id }, updateProductDto);
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.productModel.deleteOne({ _id: id });
    return deleted;
  }
}
