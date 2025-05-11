import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabase } from '@/SupabaseContext';
import { X, ArrowLeft } from 'lucide-react'; // Import the ArrowLeft icon
import Header from '@/components/Header';
import venmoLogo from '@/assets/venmo.svg';
import Congratulations from '@/components/modals/Congratulations';

const Shareable = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Google Tag Manager script for <head>
    const headScript = document.createElement('script');
    headScript.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-ML2ZRPGF');
    `;
    document.head.appendChild(headScript);

    // Google Tag Manager (noscript) for <body>
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-ML2ZRPGF"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `;
    document.body.insertBefore(noscript, document.body.firstChild);

    return () => {
      document.head.removeChild(headScript);
      document.body.removeChild(noscript);
    };
  }, []);

  const [isNicknameSet, setIsNicknameSet] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [claimedItems, setClaimedItems] = useState({});
  const [unclaimedItems, setUnclaimedItems] = useState<any[]>([]);
  const [individualTotals, setIndividualTotals] = useState({});
  const [transaction, setTransaction] = useState<any>(null);
  const [transactionName, setTransactionName] = useState<string | null>(null);
  const [paymentUsername, setPaymentUsername] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false); // Add state for help text
  const helpText = "Select to claim your items, see your total, and pay back what you owe!";
  const supabase = useSupabase();
  const { id } = useParams();
  const [showCongratulations, setShowCongratulations] = useState(false);

  // Move handleUpdates inside component
  const handleUpdates = (payload) => {
    console.log("Change received!", payload);
    // We need to fetch the updated items when changes occur
    fetchItems();
  }

  const calcTaxTipTotalShare = (totalAfterTax: number, tax: number, tip: number, individualPreTax: number) => {
    const totalPreTax = totalAfterTax - tax;
    console.log("totalPreTax", totalPreTax);
    const individualPercentage = individualPreTax / totalPreTax;
    console.log("individualPercentage", individualPercentage);
    const individualTax = parseFloat((tax * individualPercentage).toFixed(2)); // this should be formatted as a dollar amount with two decimal places
    console.log("individualTax", individualTax);
    const individualTip = parseFloat((tip * individualPercentage).toFixed(2));
    console.log("individualTip", individualTip);
    const individualTotal = parseFloat((individualPreTax + individualTax + individualTip).toFixed(2));
    return {
      individualTotal,
      individualTax,
      individualTip,
    }
  }

  // Fetch transaction
  const fetchTransaction = async () => {
    const { data, error } = await supabase.from('transaction').select('*').eq('id', id).single();
    if (error) {
      console.error('Error fetching transaction:', error);
      setError('Error fetching transaction');
    } else {
      setTransaction(data);
      setTransactionName(data.restaurant);
      setPaymentUsername(data.payment_username);
      setPaymentMethod(data.payment_method);
    }
  };

  // Divide items into claimed and unclaimed
  const divideItems = (items: any[]) => {
    const claimedItemsRaw = items.filter((item) => item.owner_nickname);
    const unclaimedItems = items.filter((item) => !item.owner_nickname);
    const claimedItems = {};

    claimedItemsRaw.forEach((item) => {
      const ownerNickname = item.owner_nickname.toLowerCase(); // Normalize to lowercase
      if (!claimedItems[ownerNickname]) {
        claimedItems[ownerNickname] = [];
      }
      claimedItems[ownerNickname].push(item);
    });

    const individualTotals = {};
    Object.keys(claimedItems).forEach((nickname) => {
      const normalizedNickname = nickname.toLowerCase(); // Ensure consistent comparison
      const individualPreTax = claimedItems[normalizedNickname].reduce((acc, item) => acc + item.cost, 0);
      const { individualTotal, individualTax, individualTip } = calcTaxTipTotalShare(transaction.total, transaction.tax, transaction.tip, individualPreTax);
      individualTotals[normalizedNickname] = { individualTotal, individualTax, individualTip };
    });

    setClaimedItems(claimedItems);
    setUnclaimedItems(unclaimedItems);
    setIndividualTotals(individualTotals);
  };

  // Fetch items
  const fetchItems = async () => {
    const { data, error } = await supabase.from('item').select('*').eq('transaction_id', id);
    if (error) {
      console.error('Error fetching items:', error);
      setError('Error fetching items');
    } else {
      setItems(data);
      divideItems(data);
    }
  };

  // Move fetchItems outside of useEffect so it can be called from handleUpdates
  useEffect(() => {
    const fetchTransactionData = async () => {
      await fetchTransaction(); // Fetch the transaction
    };

    fetchTransactionData();
  }, [id, supabase]); // Only run when id or supabase changes

  useEffect(() => {
    if (transaction) { // Only fetch items if transaction is not null
      const fetchItemsData = async () => {
        console.log("transaction", transaction);
        await fetchItems(); // Fetch the items
      };

      fetchItemsData();

      // Set up subscription to claims
      const channel = supabase
        .channel('claims')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'item', filter: `transaction_id=eq.${id}` }, handleUpdates)
        .subscribe();
      
      // Clean up subscription when component unmounts
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [transaction]); // Run when transaction changes

  const toggleItemSelection = (itemName: string) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(itemName)
        ? prevSelectedItems.filter((i) => i !== itemName)
        : [...prevSelectedItems, itemName]
    );
  };

  if (error) {
    return <div>{error}</div>;
  }

  const updateSelectedItems = async () => {
    console.log("Starting updateSelectedItems with nickname:", nickname);
    console.log("Selected items:", selectedItems);

    // Check if this is the first claim for this nickname BEFORE making any updates
    const { data: existingClaims, error: claimsError } = await supabase
      .from('item')
      .select('id, owner_nickname')
      .eq('owner_nickname', nickname?.toLowerCase())
      .eq('transaction_id', id); // Add this line to only check claims in current transaction
    
    if (claimsError) {
      console.error('Error checking existing claims:', claimsError);
    }

    const isFirstClaim = !existingClaims || existingClaims.length === 0;
    console.log("First claim check:", {
      existingClaims,
      isFirstClaim,
      transactionId: id,
      nickname: nickname?.toLowerCase()
    });

    // Fetch the latest state of the selected items
    const { data: latestItems, error: fetchError } = await supabase
      .from('item')
      .select('id, owner_nickname')
      .in('id', selectedItems);

    if (fetchError) {
      console.error('Error fetching latest item states:', fetchError);
      setError('Error fetching latest item states');
      return;
    }

    // Filter out items that are already claimed by others
    const unclaimedItemsToClaim = latestItems.filter(
      (item) => !item.owner_nickname || item.owner_nickname.toLowerCase() === nickname?.toLowerCase()
    );

    // Update database for unclaimed items
    const { data, error } = await supabase
      .from('item')
      .update({ owner_nickname: nickname?.toLowerCase() })
      .eq('transaction_id', id)
      .in('id', unclaimedItemsToClaim.map((item) => item.id));

    if (error) {
      console.error('Error updating items:', error);
      setError('Error updating items');
    } else {
      console.log('Items updated successfully:', data);
      await fetchItems(); // Refresh items to get updated totals
      
      if (isFirstClaim) {
        console.log("Showing congratulations modal for first claim");
        setShowCongratulations(true);
      } else {
        console.log("Not showing congratulations modal - not first claim");
      }
    }

    // Clear selected items for the current user
    setSelectedItems([]);
  };

  const unclaimAllItems = async () => {
    const { data, error } = await supabase
      .from('item')
      .update({ owner_nickname: null })
      .eq('transaction_id', id)
      .eq('owner_nickname', nickname?.toLowerCase()); // Normalize nickname to lowercase
    if (error) {
      console.error('Error unclaiming items:', error);
      setError('Error unclaiming items');
    } else {
      console.log('Items unclaimed successfully:', data);
      fetchItems();
    }
  };

  const handleTrySample = () => {
    // Navigate to the index page with a query parameter
    navigate('/scan/?useSample=true');
  };

  return (
    <div className="flex flex-col flex-grow bg-gradient-to-b from-indigo-100 to-white p-4 md:p-8 mx-4 my-4 rounded-lg mb-10">
      <Header />
      <div className="absolute inset-x-0 -top-60 transform-gpu overflow-hidden blur-3xl sm:-top-96">
        <div className="relative left-[calc(50%-20rem)] aspect-[1155/678] w-[48rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#87dfff] to-[#9dc6fa] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[96rem]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 transform-gpu overflow-hidden blur-3xl sm:bottom-60">
        <div className="relative right-[calc(50%-20rem)] aspect-[1155/678] w-[48rem] translate-x-1/2 rotate-[-30deg] bg-gradient-to-tr from-[#b3bbff] to-[#b3faff] opacity-30 sm:right-[calc(50%-40rem)] sm:w-[96rem]" />
      </div>
      <div className="flex flex-col flex-grow items-center justify-center">
        <div className={`bg-white bg-opacity-30 backdrop-blur-md rounded-lg p-8 max-w-lg w-full transition-all ease-in-out duration-300 ${isNicknameSet ? 'mb-20' : 'mb-0'}`}>
        <div className={`transition-opacity duration-700 ${isNicknameSet ? 'opacity-0' : 'opacity-100'}`}>
          {!isNicknameSet && (
            <>
              <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">What's your nickname?</h1>
              <input 
                type="text"
                placeholder="Type here..."
                className="w-full px-4 py-2 rounded-full border text-center"
                onChange={(e) => setNickname(e.target.value.toLowerCase())} // Normalize input to lowercase
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nickname && nickname.trim() !== '') {
                    setIsNicknameSet(true);
                  }
                }}
              />
              <br/><br/>
              <button
                className={`w-full py-2 rounded-lg transition-all duration-300 opacity-0 animate-fade-float-in ${
                  nickname && nickname.trim() !== '' 
                    ? 'bg-blue-400 text-white hover:bg-blue-500 cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (nickname && nickname.trim() !== '') {
                    setIsNicknameSet(true);
                  }
                }}
              >
                Claim your items
              </button>
            </>
          )}
        </div>
        <div className={`transition-opacity duration-700 ${isNicknameSet ? 'opacity-100' : 'opacity-0'}`}>
          {isNicknameSet && (
            <>
              <div className="flex items-center mb-4">
                <ArrowLeft
                  className="h-6 w-6 cursor-pointer text-gray-800 hover:text-gray-600" // Reduced size for smaller button
                  onClick={() => setIsNicknameSet(false)} // Go back to the nickname input page
                />
              </div>
              <div className="flex justify-center mb-6 relative">
                {paymentUsername && paymentMethod ? (
                  paymentMethod === 'Venmo' ? (
                    <a
                      href={`https://account.venmo.com/u/${paymentUsername.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 inline-flex items-center gap-2 text-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 shadow-lg hover:underline"
                    >
                      <b>{paymentMethod}</b>
                      {paymentUsername}
                    </a>
                  ) : (
                    <p className="px-4 py-2 inline-flex items-center gap-2 text-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 shadow-lg">
                      <b>{paymentMethod}</b>
                      {paymentUsername}
                    </p>
                  )
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="absolute top-[-45px] right-[-20px] text-black border border-black rounded-full w-8 h-8 flex items-center justify-center" // Adjusted top position further upward
                  aria-label="Help"
                >
                  ?
                </button>
                {showHelp && (
                  <div className="absolute top-10 right-[-50px] bg-white border border-gray-300 shadow-lg rounded-md p-4 w-64 z-10">
                    <p className="text-sm text-gray-700">{helpText}</p>
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">{transactionName}</h1>
              <div className={`space-y-4 w-full transition-all duration-300 ${selectedItems.length > 0 ? 'mb-6' : ''}`}>
                {Object.keys(claimedItems).map((item) => (
                  <>
                    <div className="flex flex-row justify-between w-full px-6 py-4 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 text-gray-800 border-t-4 border-orange-300 shadow-lg">
                      <div className="flex flex-col space-y-2">
                        <p className="font-semibold text-lg">{item}</p>
                        {claimedItems[item].map((item) => (
                          <p className="text-sm">{item.item_name} - <span className="font-medium">${item.cost}</span></p>
                        ))}
                      </div>
                      <div className="flex flex-col space-y-2 text-right">
                        <p className="text-sm">Tax: <span className="font-medium">${individualTotals[item].individualTax}</span></p>
                        <p className="text-sm">Tip: <span className="font-medium">${individualTotals[item].individualTip}</span></p>
                        <p className="text-sm"><b>Total:</b> <span className="font-bold">${individualTotals[item].individualTotal}</span></p>
                        {nickname && nickname === item && (
                          <div className="flex justify-end">
                            <X className="h-4 w-4 cursor-pointer" onClick={() => unclaimAllItems()} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ))}
                {unclaimedItems.length > 0 && <p className="text-gray-800 mb-6 text-center">What items were yours {nickname}?</p>}
                {unclaimedItems.map((item) => (
                  <div
                    key={`${item.id}`}
                    onClick={() => toggleItemSelection(`${item.id}`)} // TODO: add full item, might make it easier to update state after claim and before backend updated
                    className={`cursor-pointer w-full px-4 py-2 rounded-full border text-center ${
                      selectedItems.includes(`${item.id}`)
                        ? 'bg-blue-400 text-white'
                        : 'bg-white text-gray-800 border border-grey-300'
                    } transition-colors duration-200`}
                  >
                    {item.item_name} - ${item.cost}
                  </div>
                ))}
              </div>
              {selectedItems.length > 0 && (
                <button
                  className="w-full bg-blue-400 text-white py-2 rounded-lg hover:bg-blue-500 transition-opacity duration-300 opacity-0 animate-fade-float-in"
                  onClick={updateSelectedItems}
                >
                  Claim
                </button>
              )}
            </>
          )}
          </div>
        </div>
      </div>
      {showCongratulations && individualTotals[nickname] && (
        <Congratulations 
          name={nickname}
          value={individualTotals[nickname].individualTotal}
          onClose={() => setShowCongratulations(false)}
          onTrySample={handleTrySample}
        />
      )}
    </div>
  );
};

export default Shareable;
