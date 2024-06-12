import React, { useState, useEffect } from 'react'
import { TextField } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import theme from '../../hooks/theme'

const MFilter = (props: {
    placeholder: string,
    filterConfig: {
        data: any[],
        filterFunction: (item: any, searchTerm: string) => boolean,
        setFilteredData: (filteredData: any[]) => void
        sortFunction?: (a: any, b: any, sortCriteria: { column: string, order: string }) => number
    }[]
    sortCriteria?: { column: string, order: string }
}) => {
    const { placeholder, filterConfig, sortCriteria } = props

    const [searchTerm, setSearchTerm] = useState('')

    const handleFilteredChange = (value: React.SetStateAction<string>) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        filterConfig.forEach(({ data, filterFunction, setFilteredData, sortFunction }) => {
            let filtered = data.filter(item => filterFunction(item, searchTerm))

            if (sortFunction && sortCriteria?.column) {
                filtered = filtered.sort((a, b) => sortFunction(a, b, sortCriteria))
            }

            setFilteredData(filtered)
        })
    }, [searchTerm, filterConfig, sortCriteria])

    return (
        <TextField
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleFilteredChange(e.target.value)}
            sx={{
                width: "100%",
                borderColor: '#E0E0E0',
                background: theme.palette.background.default,
                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
            }}
            InputProps={{
                endAdornment: <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    color={theme.palette.text.primary}
                    opacity={0.5}
                />
            }}
        />
    )
}

export default MFilter