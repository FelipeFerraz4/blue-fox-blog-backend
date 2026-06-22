package space.bluefoxaquarismo.Backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.bluefoxaquarismo.Backend.dto.author.RequestAuthorDTO;
import space.bluefoxaquarismo.Backend.dto.author.ResultAuthorDTO;
import space.bluefoxaquarismo.Backend.entity.Author;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.exception.author.AuthorAlreadyExistsException;
import space.bluefoxaquarismo.Backend.exception.author.AuthorNotFoundException;
import space.bluefoxaquarismo.Backend.mapper.AuthorMapper;
import space.bluefoxaquarismo.Backend.repository.AuthorRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;

    /**
     * Creates a new author.
     *
     * @param authorDTO The author data transfer object.
     * @return The created author, ResultAuthorDTO.
     */
    @Transactional
    public ResultAuthorDTO create(RequestAuthorDTO authorDTO) {
        validateName(authorDTO.name());
        validateSlug(authorDTO.slug());
        validateEmail(authorDTO.email());

        Author author = authorMapper.toEntity(authorDTO);

        return saveAndMap(author);
    }

    /**
     * Find an author by id.
     *
     * @param id Author id
     * @return Found author, ResultAuthorDTO
     */
    public ResultAuthorDTO findById(UUID id) {
        Author author = findAuthorEntityById(id);
        return authorMapper.toResponseDTO(author);
    }

    /**
     * Find an author by name.
     *
     * @param name Author name
     * @return Found author, ResultAuthorDTO
     */
    public ResultAuthorDTO findByName(String name) {
        Author author = authorRepository.findByName(name)
                .orElseThrow(() -> new AuthorNotFoundException("Author not found with name: " + name));

        return authorMapper.toResponseDTO(author);
    }

    /**
     * Find an author by slug.
     *
     * @param slug Author slug
     * @return Found author, ResultAuthorDTO
     */
    public ResultAuthorDTO findBySlug(String slug) {
        Author author = authorRepository.findBySlug(slug)
                .orElseThrow(() -> new AuthorNotFoundException("Author not found with slug: " + slug));

        return authorMapper.toResponseDTO(author);
    }

    /**
     * Find an author by email.
     *
     * @param email Author email
     * @return Found author, ResultAuthorDTO
     */
    public ResultAuthorDTO findByEmail(String email) {
        Author author = authorRepository.findByEmail(email)
                .orElseThrow(() -> new AuthorNotFoundException("Author not found with email: " + email));

        return authorMapper.toResponseDTO(author);
    }

    /**
     * Find all authors.
     *
     * @return List of authors
     */
    public List<ResultAuthorDTO> findAll() {
        List<Author> authors = authorRepository.findAll();
        return authors.stream().map(authorMapper::toResponseDTO).toList();
    }

    /**
     * Find all active authors.
     *
     * @return List of active authors
     */
    public List<ResultAuthorDTO> findAllActive() {
        List<Author> authors = authorRepository.findAllByStatus(Status.ACTIVE);
        return authors.stream().map(authorMapper::toResponseDTO).toList();
    }

    /**
     * Find all authors by status.
     *
     * @param status Author status
     * @return List of authors
     */
    public List<ResultAuthorDTO> findAllByStatus(Status status) {
        List<Author> authors = authorRepository.findAllByStatus(status);
        return authors.stream().map(authorMapper::toResponseDTO).toList();
    }

    /**
     * Update an existing author.
     *
     * @param id        Author id
     * @param authorDTO Author data transfer object
     * @return Updated author, ResultAuthorDTO
     */
    @Transactional
    public ResultAuthorDTO update(UUID id, RequestAuthorDTO authorDTO) {
        Author author = findAuthorEntityById(id);

        if (!author.getName().equals(authorDTO.name())) {
            validateName(authorDTO.name());
        }

        if (!author.getSlug().equals(authorDTO.slug())) {
            validateSlug(authorDTO.slug());
        }

        if (!author.getEmail().equals(authorDTO.email())) {
            validateEmail(authorDTO.email());
        }

        author.setName(authorDTO.name());
        author.setBio(authorDTO.bio());
        author.setProfilePictureUrl(authorDTO.profilePictureUrl());
        author.setSlug(authorDTO.slug());
        author.setEmail(authorDTO.email());

        return saveAndMap(author);
    }

    /**
     * SoftDelete an existing author.
     *
     * @param id Author id
     */
    @Transactional
    public void softDelete(UUID id) {
        Author author = findAuthorEntityById(id);
        author.setStatus(Status.DELETED);
        authorRepository.save(author);
    }

    /**
     * HardDelete an existing author.
     *
     * @param id Author id
     */
    @Transactional
    public void hardDelete(UUID id) {
        Author author = findAuthorEntityById(id);
        authorRepository.delete(author);
    }

    /**
     * Update author status.
     *
     * @param id     Author id
     * @param status Author status
     * @return Updated author, ResultAuthorDTO
     */
    @Transactional
    public ResultAuthorDTO updateStatus(UUID id, Status status) {
        Author author = findAuthorEntityById(id);
        author.setStatus(status);
        return saveAndMap(author);
    }

    /**
     * Validate duplicated author name.
     *
     * @param name Author name
     */
    private void validateName(String name) {
        if (authorRepository.existsByName(name)) {
            throw new AuthorAlreadyExistsException("name", name);
        }
    }

    /**
     * Validate duplicated author slug.
     *
     * @param slug Author slug
     */
    private void validateSlug(String slug) {
        if (authorRepository.existsBySlug(slug)) {
            throw new AuthorAlreadyExistsException("slug", slug);
        }
    }

    /**
     * Validate duplicated author email.
     *
     * @param email Author email
     */
    private void validateEmail(String email) {
        if (authorRepository.existsByEmail(email)) {
            throw new AuthorAlreadyExistsException("email", email);
        }
    }

    /**
     * Find author entity by id.
     *
     * @param id Author id
     * @return Author entity
     */
    private Author findAuthorEntityById(UUID id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new AuthorNotFoundException(id));
    }

    /**
     * Save and map author entity.
     *
     * @param author Author entity
     * @return ResultAuthorDTO
     */
    private ResultAuthorDTO saveAndMap(Author author) {
        return authorMapper.toResponseDTO(
                authorRepository.save(author)
        );
    }
}