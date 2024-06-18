'use client';

import React, { useState, useEffect } from "react";
import { Key } from "@react-types/shared";
import { useToast } from './ui/use-toast';
import { useAsyncList } from "@react-stately/data";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";

interface SearchTicker {
    name: string;
    symbol: string;
    currency: string;
    birth_year: string;
    stockExchange: string;
    exchangeShortName: string;
}

const defaultTickers: SearchTicker[] = [{
    name: '',
    symbol: '',
    currency: '',
    birth_year: '',
    stockExchange: '',
    exchangeShortName: '',
}];

interface SearchTickersProps {
    setProjectName: (name: string) => void,
    setProjectSymbol: (symbol: string) => void
    setProjectExchange: (exchange: string) => void
}

export default function SearchTickers({ setProjectName, setProjectSymbol, setProjectExchange }: SearchTickersProps) {
    const fetchLimit = 25;
    const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;

    const { toast } = useToast();

    const [inputValue, setInputValue] = useState<string>("");
    const [selectedKey, setSelectedKey] = useState<Key | null>(null);
    const [items, setItems] = useState<SearchTicker[]>(defaultTickers);

    const list = useAsyncList<SearchTicker>({
        async load({ signal, filterText }) {
            if (!filterText) {
                return { items: [] };
            }
            try {
                let res = await fetch(
                    `https://financialmodelingprep.com/api/v3/search-ticker?query=${encodeURIComponent(filterText)}&limit=${fetchLimit}&apikey=${apiKey}`,
                    { signal }
                );
                if (!res.ok) {
                    throw new Error('API Error');
                }
                let json = await res.json();
                return {
                    items: json,
                };
            } catch (error) {

                if (error instanceof DOMException && error.name === 'AbortError') {
                    console.warn('Request aborted:', error);
                    return { items: [] };
                } else if (error instanceof Error) {
                    console.error('Failed to load items:', error);
                    toast({
                        title: "Error",
                        description: "Failed to fetch data. The API might be out of tokens.",
                        variant: 'destructive',
                    });
                } else {
                    console.error('Unknown error:', error);
                }
                return {
                    items: [],
                };
            }
        },
        getKey: (item: SearchTicker) => item.symbol,
    });

    useEffect(() => {
        setItems(list.items);
    }, [list.items]);

    useEffect(() => {
        console.log('Current items:', items.map(item => item));
    }, [items]);

    const onSelectionChange = (key: Key | null) => {
        const selectedItem = items.find((option) => option.symbol === key);
        if (selectedItem) {
            setSelectedKey(key);
            setInputValue(selectedItem.symbol)
            setProjectName(`${selectedItem.name}`)
            setProjectSymbol(`${selectedItem.symbol}`)
            setProjectExchange(`${selectedItem.exchangeShortName}`)
        }
    };

    const onInputChange = (inputValue: string) => {
        list.setFilterText(inputValue);
        setInputValue(inputValue);
    };

    return (
        <Autocomplete
            autoFocus
            items={items}
            inputValue={inputValue}
            selectedKey={selectedKey}
            onInputChange={onInputChange}
            onSelectionChange={onSelectionChange}
            showScrollIndicators
            allowsCustomValue={true}
            isLoading={list.isLoading}

            label="Search a company"
            placeholder="Type to search..."
            aria-label="Select a company ticker"

            size='md'
            variant="bordered"
            radius="none"
            className="max-w-xs"
            classNames={{
                base: "data-[focus-visible=true]:ring-primary",
                listboxWrapper: "max-h-[320px]",
                selectorButton: "text-default-500"
            }}
            inputProps={{
                classNames: {
                    input: "ml-1",
                },
            }}
            scrollShadowProps={{ style: { maxHeight: '200px' } }}
            listboxProps={{ style: { maxHeight: '200px', overflowY: 'auto' } }}

        >
            {(item) => (
                <AutocompleteItem
                    key={item.symbol}
                    textValue={item.symbol}

                >
                    {item.name} {item.symbol}
                </AutocompleteItem>
            )}

        </Autocomplete>
    );
}
