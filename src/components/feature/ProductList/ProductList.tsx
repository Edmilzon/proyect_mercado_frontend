import Card from "../../common/Card/Card";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils/helpers";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function ProductCard({ product, quantity, onIncrement, onDecrement }: ProductCardProps) {
  const { nombre, descripcion, imagen, precio, stock } = product;
  const priceNumber = parseFloat(precio);

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between bg-gray-100 rounded-lg p-4 shadow w-full">
        <div className="flex flex-col gap-2 flex-1">
          <h1 className="text-sm font-bold text-gray-900">{nombre}</h1>
          <span className="text-xs text-gray-600 italic">{descripcion}</span>
          <h2 className="text-2xl font-bold text-gray-900">
            {formatCurrency(priceNumber)}
          </h2>
        </div>
        <div className="w-24 h-24 ml-2 rounded-lg bg-gray-400 flex-shrink-0 overflow-hidden">
          <Card imageUrl={imagen} alt={nombre} />
        </div>
      </div>
      {stock && stock > 0 ? (
        <div className="flex gap-2 bg-gray-400 rounded-lg p-2 w-fit mt-2 items-center justify-center">
          <button
            onClick={onDecrement}
            className="bg-white text-black w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Restar"
            disabled={quantity <= 0}
          >
            -
          </button>
          <span className="text-lg font-semibold min-w-[2rem] text-center">{quantity}</span>
          <button
            onClick={onIncrement}
            className="bg-white text-black w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Sumar"
            disabled={stock !== undefined && quantity >= stock}
          >
            +
          </button>
        </div>
      ) : (
        <div className="mt-2 p-2 bg-red-100 rounded-lg text-center">
          <span className="text-red-600 font-semibold text-sm">Agotado, pronto volveremos con más</span>
        </div>
      )}
    </div>
  );
}
