import React, { useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food, { FoodType } from '../../components/Food';
import ModalAddFood, { FormData } from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface DashboardData {
  foods: FoodType[],
  editingFood: FoodType,
  modalOpen: boolean,
  editModalOpen: boolean,
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    foods: [],
    editingFood: {} as FoodType,
    modalOpen: false,
    editModalOpen: false,
  });

  useEffect(() => {
    (async () => {
      const response = await api.get('/foods');

      setDashboardData({ foods: response.data, editingFood: {} as FoodType, modalOpen: false, editModalOpen: false })
    })()
  }, [])

  const handleAddFood = async (food: FormData) => {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setDashboardData({ ...dashboardData, foods: [ ...dashboardData.foods, response.data] });
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food: FoodType) => {
    try {
      const foodUpdated = await api.put(
        `/foods/${dashboardData.editingFood.id}`,
        { ...dashboardData.editingFood, ...food },
      );

      const foodsUpdated = dashboardData.foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setDashboardData({ ...dashboardData, foods: foodsUpdated });
    } catch (err) {
      console.log(err);
    }
  }

  const handleDeleteFood = async (id: number) => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = dashboardData.foods.filter(food => food.id !== id);

    setDashboardData({ ...dashboardData, foods: foodsFiltered });
  }

  const toggleModal = () => {
    setDashboardData({ ...dashboardData, modalOpen: !dashboardData.modalOpen });
  }

  const toggleEditModal = () => {
    setDashboardData({ ...dashboardData, editModalOpen: !dashboardData.editModalOpen });
  }

  const handleEditFood = (food: FoodType) => {
    setDashboardData({ ...dashboardData, editingFood: food, editModalOpen: true });
  }
  
  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={dashboardData.modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={dashboardData.editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={dashboardData.editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {dashboardData.foods &&
          dashboardData.foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}
