'use client'

import React, { Key, useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import { useAsyncList } from "@react-stately/data";
import { useFilter } from "@react-aria/i18n";


interface SearchTicker {
    name: string;
    symbol: string;
    currency: string;
    birth_year: string;
    stockExchange: string;
    exchangeShortName: string;
};

type FieldState = {
    selectedKey: Key | null;
    inputValue: string;
    items: SearchTicker[];
};

type SWCharacter = {
    name: string;
    height: string;
    mass: string;
    birth_year: string;
};

const defaultTickers = [{
    name: '',
    symbol: '',
    currency: '',
    birth_year: '',
    stockExchange: '',
    exchangeShortName: '',
}]

export default function SearchTicker() {

    const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY
    const limit = 15

    const [value, setValue] = useState<string>('tsla');
    const [selectedKey, setSelectedKey] = useState(null);

    const [fieldState, setFieldState] = useState<FieldState>({
        selectedKey: null,
        inputValue: "",
        items: defaultTickers,
    });

    // let list = useAsyncList<SWCharacter>({

    //     async load({ signal, filterText }) {
    //         let res = await fetch(`https://swapi.py4e.com/api/people/?search=${filterText}`, { signal });
    //         // let res = await fetch(`https://financialmodelingprep.com/api/v3/search-ticker?query=${filterText}&limit=${limit}&apikey=${apiKey}`, { signal });

    //         console.log('LIST', res);

    //         let json = await res.json();

    //         return {
    //             items: json.results,
    //         };
    //     },
    // });

    let list = useAsyncList<SearchTicker>({
        async load({ signal, filterText }) {
            // Default to an empty string if filterText is undefined
            let query = filterText || '';

            if (!query.trim()) {
                // Avoid making unnecessary API calls with empty filter text
                return { items: [] };
            }
            let res = await fetch(
                `https://financialmodelingprep.com/api/v3/search-ticker?query=${encodeURIComponent(query)}&limit=${limit}&apikey=${apiKey}`,
                { signal }
            );
            console.log('res', res);

            let json = await res.json();

            console.log('json', json);

            const updatedList = list.reload()

            console.log('updatedList', updatedList);
            

            // setFieldState( (prevValue) => ( {...prevValue, items: updatedList.items } ))


            // Ensure items key exists and has a value, even if it's an empty array
            return {
                items: json
            };
        },
    });



    // Implement custom filtering logic and control what items are available to the Autocomplete.
    const { startsWith } = useFilter({ sensitivity: "base" });

    // Specify how each of the Autocomplete values should change when an option is selected from the list box
    const onSelectionChange = (key: Key | null): void => {
        if (key === null) {
            setFieldState(prevState => ({
                ...prevState,
                selectedKey: null,
                inputValue: ''
            }));
        } else {
            const selectedItem = fieldState.items.find(item => item.symbol === key);
            if (selectedItem) {
                setFieldState(prevState => ({
                    ...prevState,
                    selectedKey: key,
                    inputValue: selectedItem.name
                }));
            }
        }
    }

    // Specify how each of the Autocomplete values should change when the input field is altered by the user
    const onInputChange = (value: string) => {
        setFieldState((prevState) => ({
            inputValue: value,
            selectedKey: value === "" ? null : prevState.selectedKey,
            items: fieldState.items.filter((item) => startsWith(item.name, value)),
        }));
    };

    // let list = useAsyncList<SearchTicker>({
    //     async load({ signal, filterText }) {
    //         // Default to an empty string if filterText is undefined
    //         let query = filterText || '';

    //         if (!query.trim()) {
    //             // Avoid making unnecessary API calls with empty filter text
    //             return { items: [] };
    //         }
    //         let res = await fetch(
    //             `https://financialmodelingprep.com/api/v3/search-ticker?query=${encodeURIComponent(query)}&limit=${limit}&apikey=${apiKey}`,
    //             { signal }
    //         );
    //         console.log('res', res);

    //         let json = await res.json();

    //         console.log('json', json);


    //         // Ensure items key exists and has a value, even if it's an empty array
    //         return {
    //             items: json
    //         };
    //     },
    // });

    // const onSelectionChange = (key: any) => {
    //     setSelectedKey(key);
    // };

    // const onInputChange = (value: any) => {
    //     setValue(value)
    // };

    console.log('LIST', list)

    return (
        <Autocomplete
            className="max-w-xs"
            inputValue={fieldState.inputValue}
            isLoading={list.isLoading}
            items={fieldState.items}
            label="Search a company"
            placeholder="Type to search..."
            variant="bordered"
            allowsCustomValue={true}
            onInputChange={onInputChange}
            // selectedKey={fieldState.selectedKey}
            onSelectionChange={onSelectionChange}

        >
            {(item) => (
                <AutocompleteItem key={item.name} className="capitalize">
                    {item.name}
                </AutocompleteItem>
            )}
        </Autocomplete>
    );
}
