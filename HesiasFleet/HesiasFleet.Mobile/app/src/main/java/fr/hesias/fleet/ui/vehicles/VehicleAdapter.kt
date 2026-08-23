package fr.hesias.fleet.ui.vehicles

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import fr.hesias.fleet.data.model.Vehicle
import fr.hesias.fleet.databinding.ItemVehicleBinding

class VehicleAdapter(
    private val onClick: (Vehicle) -> Unit
) : ListAdapter<Vehicle, VehicleAdapter.VH>(DIFF) {

    inner class VH(private val binding: ItemVehicleBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(v: Vehicle) {
            binding.textTitle.text = "${v.brand} ${v.model}"
            binding.textIdentifier.text = v.displayIdentifier()
            binding.textMileage.text = "%,d km".format(v.mileage)
            binding.root.setOnClickListener { onClick(v) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemVehicleBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) = holder.bind(getItem(position))

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<Vehicle>() {
            override fun areItemsTheSame(a: Vehicle, b: Vehicle) = a.id == b.id
            override fun areContentsTheSame(a: Vehicle, b: Vehicle) = a == b
        }
    }
}
