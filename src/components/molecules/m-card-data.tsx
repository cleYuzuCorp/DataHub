import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import theme from "../../theme"
import { Contact } from "../../interfaces/contact"

const MCardData = (props: { number: number, label: string, contacts: Contact[] }) => {

    const { number, label, contacts } = props

    return (
        <Stack>
            <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                width="100%"
                height="200px"
                sx={{
                    borderRadius: '15px 15px 0px 0px',
                    background: theme.palette.text.primary
                }}
            >
                <Typography variant="h3" color={theme.palette.background.default}>
                    {number}
                </Typography>

                <Typography textAlign="center" color={theme.palette.background.default}>
                    {label}
                </Typography>
            </Stack>

            <Table component={Paper} sx={{ width: '100%', background: theme.palette.background.default }}>
                <TableHead>
                    <TableRow>
                        <TableCell align="left">
                            <Typography variant="body2">
                                Intitulé de poste
                            </Typography>
                        </TableCell>
                        <TableCell align="right">
                            <Typography variant="body2">
                                Occurences
                            </Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {contacts.map((contact) =>
                        <TableRow key={contact.jobTitle}>
                            <TableCell align="left">
                                <Typography>
                                    {contact.jobTitle}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography>
                                    {contact.occurences}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Stack>
    )
}

export default MCardData