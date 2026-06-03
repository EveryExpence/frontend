import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Account } from '@/types/data/account';
import { Category } from '@/types/data/category';
import { PaymentMethod } from '@/types/data/paymentMethod';
import AccountSelection from '@/components/new-expense/AccountSelection';
import AmountInput from '@/components/new-expense/AmountInput';
import CategorySelection from '@/components/new-expense/CategorySelection';
import PaymentMethodSelection from '@/components/new-expense/PaymentMethodSelection';
import DateTimeSelection from '@/components/new-expense/DateTimeSelection';
import DescriptionInput from '@/components/new-expense/DescriptionInput';
import ImageAttachmentSelection from '@/components/new-expense/ImageAttachmentSelection';
import { ExpenseRecordInputDTO } from '@/types/data/expenseRecord';
import { createExpenseRecord } from '@/data/expenseRecords';
import { saveAttachments } from '@/data/attachments';
import { useSQLiteContext } from 'expo-sqlite';
import Toast from 'react-native-toast-message';
import LocationSelection from '@/components/new-expense/LocationMap';
import { Coordinates } from '@/types/data/location';
import Topbar from '@/components/Topbar';
import { useSync } from '@/context/syncContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { apiFetch } from '@/utils/apiFetch';
import { analyzeReceiptEndpoint } from '@/constants/endpoints';
import { getAllCategories } from '@/data/categories';
import { getAllPaymentMethods } from '@/data/paymentMethods';
import { useAuth } from '@/context/authContext';

export default function NewExpense() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { triggerSync } = useSync();
  const db = useSQLiteContext();
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [amount, setAmount] = useState("");
  const safeAmount = (amount ?? '').toString().trim();
  const isAmountValid = safeAmount === '' || /^-?\d*\.?\d+$/.test(safeAmount);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeReceipt = async () => {
    if (images.length === 0) {
      Toast.show({ text1: "Please select an image first", type: "error" });
      return;
    }
    setIsAnalyzing(true);
    try {
      const localCats = await getAllCategories(db);
      const localPMs = await getAllPaymentMethods(db);

      const formData = new FormData();
      images.forEach((imageUri) => {
        const filename = imageUri.split('/').pop() || 'receipt.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('images', { uri: imageUri, name: filename, type } as any);
      });

      localCats.forEach(c => formData.append('categories', c.name));
      localPMs.forEach(pm => formData.append('paymentMethods', pm.name));

      const response = await apiFetch(analyzeReceiptEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Failed to analyze receipt");
      }

      const data = await response.json();

      if (data.amount) {
        setAmount(data.amount.toString());
      }

      let desc = data.store_name || "";
      if (data.products && data.products.length > 0) {
        const productLines = data.products
          .map((p: any) => `- ${p.name}: ${p.price}`)
          .join('\n');
        desc = desc ? `${desc}\n\nProducts:\n${productLines}` : productLines;
      }
      if (desc) {
        setDescription(desc);
      }

      if (data.category) {
        const matchedCat = localCats.find(c => c.name === data.category);
        if (matchedCat) {
          setSelectedCategory(matchedCat);
        }
      }

      if (data.payment_method) {
        const matchedPM = localPMs.find(pm => pm.name === data.payment_method);
        if (matchedPM) {
          setSelectedPaymentMethod(matchedPM);
        }
      }

      if (data.location && data.location.lat && data.location.lng) {
        setLocation({
          latitude: data.location.lat,
          longitude: data.location.lng,
        });
      }

      Toast.show({ text1: "Receipt analysis completed!" });
    } catch (error: any) {
      console.error(error);
      Toast.show({ text1: "Failed to analyze receipt", text2: error.message, type: "error" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveRecord = async () => {
    if (selectedAccount === null || selectedCategory === null || selectedPaymentMethod === null || !isAmountValid) {
      Toast.show({ text1: "All required fields are needed", type: "error" });
      return;
    }
    const amountNumber = Number(amount);
    if (amountNumber === 0) {
      Toast.show({ text1: "Ammount has to be non-zero", type: "error" });
      return;
    }

    const expenseRecord: ExpenseRecordInputDTO = {
      amount: amountNumber,
      description,
      paymentMethodId: selectedPaymentMethod.id,
      categoryId: selectedCategory.id,
      accountId: selectedAccount.id,
      createdAt: selectedDateTime.getTime(),
      location: location === null ? undefined : `${location?.latitude};${location?.longitude}`,
    };

    try {
      const id = await createExpenseRecord(db, expenseRecord);
      if (images.length > 0) {
        await saveAttachments(db, id, images);
      }
      Toast.show({ text1: "Record was added" });
      setSelectedAccount(null);
      setSelectedCategory(null);
      setSelectedPaymentMethod(null);
      setSelectedDateTime(new Date());
      setAmount("");
      setDescription("");
      setImages([]);
      setLocation(null);
      triggerSync();
    } catch {
      Toast.show({ text1: "Failed to add a new record", type: "error" });
    }
  }

  return (
    <SafeAreaView>
      <Topbar title="New Expense" />
      <ScrollView className="px-4" scrollEnabled={scrollEnabled}>
        <AccountSelection selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />

        <AmountInput selectedAccount={selectedAccount} amount={amount} setAmount={setAmount} isValid={isAmountValid} />

        <CategorySelection selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

        <PaymentMethodSelection selectedPaymentMethod={selectedPaymentMethod} setSelectedPaymentMethod={setSelectedPaymentMethod} />

        <DateTimeSelection selectedDateTime={selectedDateTime} setSelectedDateTime={setSelectedDateTime} />

        <DescriptionInput description={description} setDescription={setDescription} />

        <LocationSelection location={location} setLocation={setLocation} setScrollEnabled={setScrollEnabled} />

        <ImageAttachmentSelection images={images} setImages={setImages} />

        {user !== null && images.length > 0 && (
          <TouchableOpacity
            onPress={analyzeReceipt}
            disabled={isAnalyzing}
            className="w-full bg-theme-surface py-3.5 rounded-md mb-8 flex-row justify-center items-center gap-2 border border-theme-tint"
            style={{ opacity: isAnalyzing ? 0.7 : 1 }}
          >
            {isAnalyzing ? (
              <ActivityIndicator color={colors.tint} />
            ) : (
              <MaterialCommunityIcons name="image-search-outline" size={20} color={colors.tint} />
            )}
            <Text className="text-lg text-theme-tint font-bold">
              {isAnalyzing ? "Analyzing receipt..." : "Analyze receipt with AI"}
            </Text>
          </TouchableOpacity>
        )}


        <TouchableOpacity onPress={saveRecord} className="w-full bg-theme-tint py-4 rounded-md">
          <Text className="text-xl text-theme-textLight text-center font-bold">Save a new record</Text>
        </TouchableOpacity>

        <View className="py-20" />
      </ScrollView>
    </SafeAreaView>
  )
}
