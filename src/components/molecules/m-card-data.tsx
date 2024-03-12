import { Paper, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from "@mui/material"
import theme from "../../theme"
import { JobTitle } from "../../interfaces/job-title"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons"

const MCardData = (props: { number: number, label: string, jobTitles: JobTitle[] }) => {

    const { number, label, jobTitles } = props

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const startIndex = page * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const toggleSortOrder = () => {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'))
    }

    const sortedJobTitle = jobTitles.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.occurences - b.occurences
        } else {
            return b.occurences - a.occurences
        }
    })

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
                            <Stack
                                spacing={1}
                                direction="row"
                                alignItems="center"
                                onClick={toggleSortOrder}
                                sx={{
                                    cursor: 'pointer'
                                }}
                            >
                                <Typography variant="body2">
                                    Occurences
                                </Typography>
                                {sortOrder === 'asc' ?
                                    <FontAwesomeIcon icon={faArrowUp} /> :
                                    <FontAwesomeIcon icon={faArrowDown} />
                                }
                            </Stack>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedJobTitle.slice(startIndex, endIndex).map((jobTitle) =>
                        <TableRow key={jobTitle.jobTitle}>
                            <TableCell align="left">
                                <Typography>
                                    {jobTitle.jobTitle}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography>
                                    {jobTitle.occurences}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {sortedJobTitle.length > 9 && <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={sortedJobTitle.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10))
                    setPage(0)
                }}
                labelRowsPerPage={""}
            />}
        </Stack>
    )
}

export default MCardData