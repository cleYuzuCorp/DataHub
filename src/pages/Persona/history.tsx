import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Checkbox, Container, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useMediaQuery } from "@mui/material"
import { useState } from "react"
import AButton from "../../components/atoms/a-button"
import theme from "../../theme"

const History = () => {

    const histories = [
        {
            idAsk: 4351,
            idEdit: 4351,
            emailEdit: "tgu@yuzucorp.com",
            jobTitle: "SalesPerson",
            persona: "-",
            personaAsk: "manager",
            personaEdit: "Manager",
            date: "10/07/2023",
            hour: "10:38:44"
        },
        {
            idAsk: 4352,
            idEdit: 4352,
            emailEdit: "nhu@yuzucorp.com",
            jobTitle: "Developer",
            persona: "-",
            personaAsk: "dev",
            personaEdit: "Dev",
            date: "20/05/2023",
            hour: "10:38:44"
        },
        {
            idAsk: 4353,
            idEdit: 4353,
            emailEdit: "mde@yuzucorp.com",
            jobTitle: "SalesPerson",
            persona: "-",
            personaAsk: "manager",
            personaEdit: "Manager",
            date: "15/06/2023",
            hour: "10:38:44"
        },
        {
            idAsk: 4354,
            idEdit: 4354,
            emailEdit: "cgo@yuzucorp.com",
            jobTitle: "Buisness Developer",
            persona: "-",
            personaAsk: "manager",
            personaEdit: "Manager",
            date: "25/10/2023",
            hour: "10:38:44"
        },
        {
            idAsk: 4355,
            idEdit: 4355,
            emailEdit: "cle@yuzucorp.com",
            jobTitle: "Developer",
            persona: "-",
            personaAsk: "dev",
            personaEdit: "Dev",
            date: "06/09/2023",
            hour: "10:38:44"
        }
    ]

    const isDesktop = useMediaQuery('(min-width:1000px)')

    const [searchTerm, setSearchTerm] = useState("")
    const [filteredHistory, setFilteredHistory] = useState(histories)
    const [selectedRows, setSelectedRows] = useState<Array<number>>([])

    const handleFilteredChange = (value: string) => {
        setSearchTerm(value)

        const filtered = histories.filter(history =>
            history.idAsk.toString().includes(value) ||
            history.idEdit.toString().includes(value) ||
            history.emailEdit.toLowerCase().includes(value.toLowerCase()) ||
            history.date.includes(value) ||
            history.jobTitle.toLowerCase().includes(value.toLowerCase())
        )

        setFilteredHistory(filtered)
    }

    const handleSelectAllChange = () => {
        if (selectedRows.length === filteredHistory.length) {
            setSelectedRows([])
        } else {
            setSelectedRows(Array.from({ length: filteredHistory.length }, (_, i) => i))
        }
    }

    const handleSelectChange = (index: number) => {
        if (selectedRows.includes(index)) {
            setSelectedRows(selectedRows.filter((history) => history !== index))
        } else {
            if (!selectedRows) {
                setSelectedRows([index])
            } else {
                setSelectedRows([...selectedRows, index])
            }
        }
    }

    return (
        <Container maxWidth="lg">
            <Stack spacing={8} alignItems="center" marginTop="100px" marginBottom="100px">
                <Typography variant="h3">
                    DataHub
                </Typography>

                <Stack spacing={4} width="100%">
                    <Stack spacing={4} direction="row" alignItems="center" width="100%">
                        <TextField
                            placeholder="Recherche par ID, Date, Utilisateur ou Intitulé de poste"
                            value={searchTerm}
                            onChange={(e) => handleFilteredChange(e.target.value)}
                            sx={{
                                width: "100%",
                                borderColor: '#E0E0E0',
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

                        <Stack width="100%">
                            <AButton variant="contained">
                                Restaurer la séléction
                            </AButton>
                        </Stack>
                    </Stack>

                    {isDesktop ? <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                        <TableHead sx={{ background: theme.palette.text.primary }}>
                            <TableRow>
                                <TableCell align="left">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Id demandé
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Id modifié
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Email modifié
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Intitulé de poste
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Persona
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Persona demandé
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Persona modifié
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" color={theme.palette.background.default}>
                                        Date/Heure
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Checkbox
                                        checked={selectedRows?.length === filteredHistory.length}
                                        onChange={handleSelectAllChange}
                                        indeterminate={selectedRows.length > 0 && selectedRows.length < filteredHistory.length}
                                        sx={{
                                            color: theme.palette.background.default,
                                            '&.Mui-checked': {
                                                color: theme.palette.background.default
                                            },
                                            '&.MuiCheckbox-indeterminate': {
                                                color: theme.palette.background.default
                                            }
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredHistory.map((history, index) =>
                                <TableRow>
                                    <TableCell>
                                        <Typography
                                            fontSize="11px"
                                            textAlign="center"
                                            padding="10px"
                                            borderRadius="15px"
                                            sx={{
                                                width: `${history.idAsk.toString().length}ch`,
                                                background: theme.palette.secondary.light
                                            }}
                                        >
                                            {history.idAsk}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography
                                            fontSize="11px"
                                            textAlign="center"
                                            padding="10px"
                                            borderRadius="15px"
                                            sx={{
                                                width: `${history.idEdit.toString().length}ch`,
                                                background: theme.palette.info.light
                                            }}
                                        >
                                            {history.idEdit}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>
                                            {history.emailEdit}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>
                                            {history.jobTitle}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>
                                            {history.persona}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>
                                            {history.personaAsk}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>
                                            {history.personaEdit}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack>
                                            <Typography>
                                                {history.date}
                                            </Typography>
                                            <Typography>
                                                {history.hour}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Checkbox
                                            checked={selectedRows.includes(index)}
                                            onChange={() => handleSelectChange(index)}
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table> :
                        <Table component={Paper} sx={{ background: theme.palette.background.default }}>
                            <TableHead sx={{ background: theme.palette.text.primary }}>
                                <TableRow>
                                    <TableCell align="left">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Id
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Intitulé
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color={theme.palette.background.default}>
                                            Persona
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Checkbox
                                            checked={selectedRows?.length === filteredHistory.length}
                                            onChange={handleSelectAllChange}
                                            indeterminate={selectedRows.length > 0 && selectedRows.length < filteredHistory.length}
                                            sx={{
                                                color: theme.palette.background.default,
                                                '&.Mui-checked': {
                                                    color: theme.palette.background.default
                                                },
                                                '&.MuiCheckbox-indeterminate': {
                                                    color: theme.palette.background.default
                                                }
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistory.map((history, index) =>
                                    <TableRow>
                                        <TableCell align="center">
                                            <Stack
                                                textAlign="center"
                                                padding="5px"
                                                borderRadius="15px"
                                                sx={{
                                                    width: `${history.idEdit.toString().length}ch`,
                                                    background: theme.palette.secondary.light
                                                }}
                                            >
                                                <Typography fontSize="11px">
                                                    {history.idEdit}
                                                </Typography>

                                                <Typography fontSize="11px">
                                                    {history.idAsk}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>
                                                {history.jobTitle}
                                            </Typography>
                                            <Typography>
                                                {history.emailEdit}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>
                                                {history.persona}
                                            </Typography>

                                            <Typography>
                                                {history.personaAsk}
                                            </Typography>

                                            <Typography>
                                                {history.personaEdit}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Checkbox
                                                checked={selectedRows.includes(index)}
                                                onChange={() => handleSelectChange(index)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>}
                </Stack>
            </Stack>
        </Container >
    )
}

export default History