'use client'
import React, { useState, useEffect } from 'react';
import { addDoc, collection, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';
import { onSnapshot, query } from 'firebase/firestore';
import { deleteDoc, doc } from 'firebase/firestore';
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from 'axios';




interface Item {
  name: any;
  amount: any;
  id?: any;
}

export default function Home() {

  const [items, setItems] = useState<Item[]>([]);

  const [newItem, setNewItem] = useState<Item>({ name: '', amount: '' });

  //add items to database
  const addItem = async (e: any) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.amount !== '') {
      const q = query(collection(db, 'expenses'), where('name'.toLowerCase(), '==', newItem.name.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If item exists, update the quantity
        const itemDoc = querySnapshot.docs[0];
        const currentAmount = itemDoc.data().amount;
        await updateDoc(doc(db, 'expenses', itemDoc.id), {
          amount: currentAmount + parseInt(newItem.amount),
        });
      } else {
        // If item does not exist, add new item
        await addDoc(collection(db, 'expenses'), {
          name: newItem.name.trim().toLowerCase(),
          amount: parseInt(newItem.amount),
        });
      }
      setNewItem({ name: '', amount: '' });
    }
  };

  //read items from database
  useEffect(() => {
    const q = query(collection(db, 'expenses'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr: any = [];
      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);

      return () => unsubscribe();
    });

  }, [])

  //delete items from database
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'expenses', id));
  }

  // Increment item quantity
  const incrementItem = async (id: string, currentAmount: number) => {
    const itemDoc = doc(db, 'expenses', id);
    await updateDoc(itemDoc, { amount: currentAmount + 1 });
  };

  // Decrement item quantity
  const decrementItem = async (id: string, currentAmount: number) => {
    if (currentAmount > 1) {
      const itemDoc = doc(db, 'expenses', id);
      await updateDoc(itemDoc, { amount: currentAmount - 1 });
    }
    else {
      deleteItem(id);
    }
  };

  return (
    <div className="">
      <header>
        <h1 className="text-4xl text-center text-white py-4 bg-slate-700">Pantry Tracker</h1>
        <h1 className="text-xl text-center text-white py-4 bg-slate-700">Please enter your pantry contents!!</h1>
      </header>
      <div className="flex justify-center items-center mt-20">
        <form className="grid grid-cols-6 items-center text-black">
          <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="col-span-3 p-3 border-2 border-zinc-400" type="text" required placeholder="Enter Item"></input>
          <input value={newItem.amount} onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })} className="col-span-2 p-3 border-2 mx-3 border-" type="number" min="1" placeholder="Enter Quantity"></input>
          <button onClick={addItem} className="text-white bg-slate-700 hover:bg-green-900 p-3 text-xl" type="submit">+</button>
        </form>
      </div>
      <div className="flex justify-center items-center mt-4">
        <ScrollArea className="h-[400px] w-[800px] rounded-md border bg-slate-900">
          <div className="p-4 text-white">
            <h3 className="mb-4 font-medium leading-none">
              <span className="ml-5">Item</span>
              <span className="float-right mr-24">Amount</span>
            </h3>
            {items.map((item, id) => (
              <>
                <div key={id} className="text-xl my-2 w-full flex justify-between bg-slate-800">
                  <div className="p-4 w-full flex justify-between">
                    <span className="mx capitalize">{item.name}</span>
                    <span>Quantity: {item.amount}</span>
                  </div>
                  <button onClick={() => decrementItem(item.id, item.amount)} className="ml-8 p-4 border-l-4 border-slate-900 hover:bg-yellow-900 w-16">-</button>
                  <button onClick={() => incrementItem(item.id, item.amount)} className="p-4 border-l-4 border-slate-900 hover:bg-yellow-900 w-16">+</button>
                  <button onClick={() => deleteItem(item.id)} className="p-4 border-l-4 border-slate-900 hover:bg-red-900 w-24">X</button>
                </div>
              </>
            ))}
          </div>
        </ScrollArea>
        <button className="text-white bg-slate-800 p-4 mt-10">Generate Recipies</button>
      </div>

    </div>
  )
}
